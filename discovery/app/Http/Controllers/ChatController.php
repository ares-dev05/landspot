<?php

namespace App\Http\Controllers;

use App\Models\{
    ChatChannel, ChatModel, User, UserChat
};
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ChatController extends Controller
{
    function index(Request $request)
    {
        if ($request->expectsJson()) {

            /** @var User $user */
            $user = auth()->user();
            $user->setVisible(['id', 'display_name', 'user_unique_id', 'company', 'avatar']);
            $user->setAppends(['user_unique_id', 'avatar']);
            $user->load('company');
            $user->company->setVisible(['company_logo', 'company_small_logo', 'id', 'name', 'type']);

            $response = $this->prepareResponse([]);

            ChatModel::grantChannels($response['privateChannels']->toArray(), $user);

            $response['user'] = $user;
            $response['unreadMessages'] = UserChat::countUnreadMessages($user);
            return $response;
        }

        return view('chat.main');
    }

    private function prepareResponse($response = [])
    {
        /** @var User $user */
        $user                        = auth()->user();
        $response['privateChannels'] = $user
            ->chatChannel()
            ->get(['channel_name'])
            ->pluck('channel_name')
            ->push(ChatModel::getSystemChannelName($user));
        $response['recentChats']     = ChatModel::getRecentChats($user);

        return $response;
    }

    /**
     * Triggered when user wants to chat with user_id or open existing channel
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    function store(Request $request)
    {
        /** @var User $authUser */
        $authUser = auth()->user();

        if($request->has('user_id')) {
            $userID = $request->get('user_id');
            $users = [
                $userID,
                auth()->user()->id
            ];

            $user = User::findOrFail($userID);

            $this->authorize('canChat', $user);
            $channel = ChatModel::createOrFindPrivateUsersChannel($users);
            $channelName = $channel->channel_name;
        } elseif($request->has('channel_name')) {
            $channelName = $request->get('channel_name');
            $channel = $authUser->chatChannel()
                ->byName($channelName)
                ->firstOrFail();

        } else {
            throw new \InvalidArgumentException();
        }

        $interlocutor = ChatModel::getChannelInterlocutor($authUser, $channelName);
        if (!$interlocutor) {
            return $this->prepareResponse();
        }
        $interlocutor->append(['avatar']);
        $interlocutor->setVisible(['id', 'display_name', 'avatar']);

        $channel->setVisible(['channel_name', 'last_channel_message', 'readed_at']);
        $channel->append(['readed_at', 'last_channel_message']);
        $channel = $channel->toArray();

        return $this->prepareResponse(compact('channel', 'interlocutor'));
    }

    /**
     * Publish user message to Pubnub
     * @param Request $request
     * @param string $channel
     * @return array
     * @throws \Exception
     */
    function update(Request $request, $channel)
    {
        $message = $request->get('message');

        if ($message == '') {
            throw new HttpException(400, 'Message is required');
        }

        if (mb_strlen($message) > ChatModel::messageSizeLimit) {
            $message = mb_substr($message, 0, ChatModel::messageSizeLimit);
        }

        $user         = auth()->user();
        $senderUserId = $user->id;
        /** @var ChatChannel $channel */
        $channel      = $user
            ->chatChannel()
            ->byName($channel)
            ->firstOrFail();

        list($usec, $sec) = explode(" ", microtime());
        $message = [
            'timetoken'  => ((float)$usec + (float)$sec) * 10000000,
            'user_id'    => $senderUserId,
            'message'    => $message,
            'created_at' => time()
        ];

        $channel->userChat()
            ->byUserId($senderUserId)
            ->first()
            ->updateReadAtTime();

        $channel->publishMessage($message);

        $channel->setVisible(['channel_name', 'last_channel_message', 'readed_at']);
        $channel->append(['readed_at', 'last_channel_message']);
        $channel = $channel->toArray();

        return $this->prepareResponse(compact('channel'));
    }

    function listUserContactsInObject(Request $request)
    {
        /** @var User $user */
        $user  = auth()->user();

        $objectType = $request->get('item_type');
        $objectId = $request->get('item_id');
        $users = [];

        if ($user->company->isDeveloper()) {
            switch ($objectType) {
                case 'company':
                    $users = ChatModel::getContactsFromBuilderCompany($user, $objectId);
                    break;
            }
        } else {
            switch ($objectType) {
                case 'estate':
                    $users = ChatModel::getContactsFromDeveloperEstates($user, $objectId);
                    break;
            }
        }

        return ['userObjectContacts' => $users];
    }
    /**
     * @param Request $request
     * @return array
     */
    function listUserDirectory(Request $request)
    {
        /** @var User $user */
        $user  = auth()->user();
        $query = trim($request->get('query'));
        if ($user->company->isDeveloper()) {
            //Devs section. They will see builders and estates

            $results = $query == ''
                ? ['companies' => [], 'users' => []]
                : ChatModel::filterDevelopersDirectory($user, $query);
        } else {
            //Builders section. They will see estates and managers

            $results = $query == ''
                ? ['estates' => [], 'users' => []]
                : ChatModel::filterBuildersDirectory($user, $query);
        }

        return ['userContacts' => $results];
    }

    function listContactsBook()
    {
        /** @var User $user */
        $user  = auth()->user();
        if ($user->company->isDeveloper()) {
            //Devs section. They will see builders and estates

            $results = ChatModel::filterDevelopersDirectory($user, '');
        } else {
            //Builders section. They will see estates and managers

            $results = ChatModel::filterBuildersDirectory($user, '');
        }
        return ['userContacts' => $results];
    }

    function getRecentChats()
    {
        return ['recentChats' => ChatModel::getRecentChats(auth()->user())];
    }

    function getChannelHistory(Request $request)
    {
        /** @var User $user */
        $authUser = auth()->user();
        $channelName = $request->get('channel_name');
        $maxTime        = (int)$request->get('max_time');
        $minTime        = (int)$request->get('min_time');
        if ($channelName) {
            /** @var ChatChannel $channel */
            $channel = $authUser->chatChannel()
                ->byName($channelName)
                ->firstOrFail();

            $reverse = false;
            $start   = null;
            $end     = null;

            if($maxTime > 0) {
                $start   = $maxTime;
            }

            if($minTime > 0) {
                $reverse = true;
                $end = $minTime;
            }

            $count                  = 20;
            $last_channel_message   = $channel->getChannelHistoryMessages($count, $start, $end, $reverse);
            $endHistory             = false;

            if (count($last_channel_message) < $count) {
                $endHistory = true;
            }

            return compact('last_channel_message', 'endHistory');
        }
    }

    function updateChannel(Request $request, $channel)
    {
        $authUser = auth()->user();
        $authUserId = $authUser->id;

        /** @var ChatChannel $channelModel */
        $channelModel = $authUser->chatChannel()
            ->byName($channel)
            ->firstOrFail();

        $time = $channelModel
            ->userChat()
            ->ByUserId($authUserId)
            ->firstOrFail()
            ->updateReadAtTime();

        $channelModel->userChat()->each(function (UserChat $chat) use ($authUserId, $channelModel, $time) {
            if($chat->user_id != $authUserId) {
                ChatModel::sendChannelReadNotification($channelModel->channel_name, $chat->user, $time);
            }
        });

        return [
            'channels'        => [compact('channel', 'time')],
            'unread_messages' => UserChat::countUnreadMessages($authUser)
        ];
    }
}
