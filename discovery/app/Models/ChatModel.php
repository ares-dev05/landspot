<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\{Arr, Str};

/**
 * Class ChatModel
 */
class ChatModel
{
    const messageSizeLimit = 8192;
    const channelsLimit = 160;

    /**
     * @var \PubNub\PubNub
     */
    protected static $_pubNub;

    /**
     * @return \PubNub\PubNub
     */
    protected static function pubNub()
    {
        if (!self::$_pubNub) {
            $pnconfig = new \PubNub\PNConfiguration();
            $pnconfig->setSecretKey(config('app.PUBNUB_SECRET_KEY'));
            $pnconfig->setPublishKey(config('app.PUBNUB_PUBLISH_KEY'));
            $pnconfig->setSubscribeKey(config('app.PUBNUB_SUBSCRIBE_KEY'));

            self::$_pubNub = new \PubNub\PubNub($pnconfig);
        }

        return self::$_pubNub;
    }

    protected static function publish()
    {
        return self::$_pubNub->publish();
    }

    /**
     * @param $channelName
     * @param int $count
     * @param int $start
     * @param int $end
     * @param int $reverse
     * @return array
     */
    static function getChannelHistory($channelName, $count = 15, $start = null, $end = null, $reverse = null)
    {
        $result = self::pubNub()
            ->history()
            ->channel($channelName)
            ->count($count);

        if ($start) {
            $result->start($start);
        }
        if ($end) {
            $result->end($end);
        }
        if ($reverse) {
            $result->reverse(true);
        }

        $result = $result->sync();

        $messages = [];
        foreach ($result->getMessages() as $message) {
            $messages[] = $message->getEntry();
        }
        return $messages;
    }

    /**
     * @param array $userChannels
     * @param User $user
     */
    static function grantChannels(array $userChannels, User $user)
    {
        foreach ($userChannels as $channel) {
            $userChannels[] = $channel . '-pnpres';
        }

        $slices = intdiv(count($userChannels), self::channelsLimit);

        for ($i = 0; $i <= $slices; $i++) {
            $channels = array_slice($userChannels, $i, self::channelsLimit);
            if (!$channels) break;

            try {
                self::pubNub()
                    ->grant()
                    ->channels($channels)
                    ->authKeys($user->user_unique_id)
                    ->read(true)
                    ->write(true)
                    ->ttl(0)
                    ->sync();

            } catch (\PubNub\Exceptions\PubNubServerException $exception) {


            } catch (\PubNub\Exceptions\PubNubException $exception) {

            }

        };
    }

    /***
     * @param User $user
     * @param $query
     * @param \Closure $usersFilterCallback
     * @return array
     */
    static function filterBuildersDirectory(User $user, $query, $usersFilterCallback = null)
    {
        $estates = $user
            ->estate()
            ->publishedApproved()
            ->byNameLike($query)
            ->limit(500)
            ->get(['id', 'company_id', 'name', 'path', 'thumb', 'small']);

        $availableEstates = $user->estate()->get(['id', 'company_id']);
        $estateIds        = $availableEstates->pluck('id');
        $companyIds       = $availableEstates->pluck('company_id')->unique();

        //get all admins and global estate managers
        $users = User::activeAccount()
            ->with('state:id,name', 'company:id,name,type,small_logo_path')
            ->whereHas('company', function (EloquentBuilder $b) use ($companyIds) {
                $b->developerCompany();
                $b->whereIn($b->qualifyColumn('id'), $companyIds);
            })
            ->where(function (EloquentBuilder $b) {
                $b->orWhereHas('group', function (EloquentBuilder $q) {
                    $q->developerAdmins();
                });
                $b->globalEstateManager('or');
            })
            ->where(function (EloquentBuilder $b) {
                $b->whereHas('role', function (EloquentBuilder $q) {
                    $q->salesConsultants();
                });
            })
            ->byNameLike($query);

        if (is_callable($usersFilterCallback)) {
            $usersFilterCallback($users);
        };

        $users = $users->limit(250)
            ->get(['id', 'display_name', 'company_id', 'state_id', 'is_global_estate_manager']);

        $estateManagers = EstateManager::activeAccount()
            ->with('state:id,name', 'company:id,name,small_logo_path')
            ->whereHas('estate', function ($b) use ($estateIds) {
                $b->whereIn($b->qualifyColumn('id'), $estateIds);
            })
            ->where(function (EloquentBuilder $b) {
                $b->whereHas('role', function (EloquentBuilder $q) {
                    $q->salesConsultants();
                });
            })
            ->byNameLike($query);

        if (is_callable($usersFilterCallback)) {
            $usersFilterCallback($estateManagers);
        };

        $estateManagers = $estateManagers
            ->limit(250)
            ->get(['id', 'display_name', 'company_id', 'state_id']);

        $users          = self::formatUsers($users, 'developer');
        $estateManagers = self::formatUsers($estateManagers, 'estatemanager');

        $users = $users
            ->concat($estateManagers)
            ->unique('id')
            ->sortBy('display_name')
            ->values();

        return compact('estates', 'users');
    }

    /**
     * @param User $user
     * @param $query
     * @param \Closure $usersFilterCallback
     * @return array
     */
    static function filterDevelopersDirectory(User $user, $query, $usersFilterCallback = null)
    {
        $builderCompanies = $user->getBuilderCompanies();

        $companies = $user->builderCompany()
            ->byNameLike($query)
            ->get(['id', 'name', 'logo_path']);

        $users = Builder
            ::activeAccount()
            ->with('company:id,name,small_logo_path', 'group', 'state:id,name')
            ->whereHas('company', function (EloquentBuilder $b) use ($builderCompanies) {
                $b->whereIn($b->qualifyColumn('id'), array_keys($builderCompanies));
            })
            ->where(function (EloquentBuilder $b) {
                $b->whereHas('role', function (EloquentBuilder $q) {
                    $q->salesConsultants();
                });
            })
            ->byNameLike($query)
            ->limit(500);

        if (is_callable($usersFilterCallback)) {
            $usersFilterCallback($users);
        }

        $users = $users->get(['id', 'display_name', 'state_id', 'company_id']);

        $users = self::formatUsers($users, 'builder');

        return compact('companies', 'users');
    }

    private static function formatUsers(Collection $users, $type)
    {
        $userKeys = array_flip(['id', 'display_name', 'subtitle', 'avatar']);
        switch ($type) {
            case 'builder':
                $users->transform(function (Builder $item) use ($userKeys) {
                    $item->append('avatar');
                    $role             = $item->hasGroup(UserGroup::GroupBuilderAdmins) ? 'Administrator' : 'Manager';
                    $item['subtitle'] = optional($item->salesLocation()->first())->name;//"$role, {$item['company']['name']}, {$item['state']['name']}";
                    $item             = $item->toArray();

                    return array_intersect_key($item, $userKeys);
                });
                break;

            case 'developer':
                $users->transform(function (User $item) use ($userKeys) {
                    $item->append('avatar');
                    $item             = $item->toArray();
                    $role             = $item['is_global_estate_manager'] ? 'Global estate manager' : 'Developer administrator';
                    $item['subtitle'] = ''; //"$role, {$item['company']['name']}, {$item['state']['name']}";

                    return array_intersect_key($item, $userKeys);
                });
                break;

            case 'estatemanager':
                $users->transform(function (EstateManager $item) use ($userKeys) {
                    $item->append('avatar');
                    $item             = $item->toArray();
                    $item['subtitle'] = ''; //"Estate manager, {$item['company']['name']}, {$item['state']['name']}";

                    return array_intersect_key($item, $userKeys);
                });
                break;
        }

        return $users;
    }

    static function getContactsFromBuilderCompany(User $user, $companyId)
    {
        $user->builderCompany()->findOrFail($companyId);

        $users = Builder
            ::activeAccount()
            ->with('company:id,name,small_logo_path', 'group', 'state:id,name')
            ->where('company_id', $companyId)
            ->where(function (EloquentBuilder $b) {
                $b->whereHas('role', function (EloquentBuilder $q) {
                    $q->salesConsultants();
                });
            })
            ->get(['id', 'display_name', 'state_id', 'company_id']);

        return [
            'users' => self::formatUsers($users, 'builder')
        ];
    }

    static function getContactsFromDeveloperEstates(User $user, $estateId)
    {
        $estate = $user
            ->estate()
            ->publishedApproved()
            ->findOrFail($estateId);

        $users = User::activeAccount()
            ->with('state:id,name', 'company:id,name,type,small_logo_path')
            ->where('company_id', $estate->company_id)
            ->whereHas('company', function (EloquentBuilder $b) use ($estate) {
                $b->developerCompany();
            })
            ->where(function (EloquentBuilder $b) {
                $b->orWhereHas('group', function (EloquentBuilder $q) {
                    $q->developerAdmins();
                });
                $b->globalEstateManager('or');
            })
            ->where(function (EloquentBuilder $b) {
                $b->whereHas('role', function (EloquentBuilder $q) {
                    $q->salesConsultants();
                });
            })
            ->limit(500)
            ->get(['id', 'display_name', 'company_id', 'state_id', 'is_global_estate_manager']);

        $estateManagers = EstateManager::activeAccount()
            ->with('state:id,name', 'company:id,name,small_logo_path')
            ->whereHas('estate', function ($b) use ($estateId) {
                $b->where($b->qualifyColumn('id'), $estateId);
            })
            ->where(function (EloquentBuilder $b) {
                $b->whereHas('role', function (EloquentBuilder $q) {
                    $q->salesConsultants();
                });
            })
            ->get(['id', 'display_name', 'company_id', 'state_id']);

        $users          = self::formatUsers($users, 'developer');
        $estateManagers = self::formatUsers($estateManagers, 'estatemanager');

        return [
            'users' => $users
                ->concat($estateManagers)
                ->unique('id')
                ->sortBy('display_name')
                ->values()
        ];
    }

    static function hasInContacts(User $authUser, User $user)
    {
        $userID         = $user->id;
        $filterCallback = function (EloquentBuilder $b) use ($userID) {
            return $b->where($b->qualifyColumn('id'), $userID);
        };

        $contacts = $user->company->isDeveloper()
            ? self::filterBuildersDirectory($authUser, '', $filterCallback)
            : self::filterDevelopersDirectory($authUser, '', $filterCallback);

        $authorizedContact = Arr::where(
            $contacts['users']->all(),
            function ($value) use ($userID) {
                return $value['id'] == $userID;
            });

        return count($authorizedContact) > 0;
    }

    /**
     * @param ChatChannel $channel
     * @param array $message
     * @return \PubNub\Models\Consumer\PNPublishResult
     */
    static function publishMessage(ChatChannel $channel, $message)
    {
        $result = self::pubNub()
            ->publish()
            ->channel($channel->channel_name)
            ->message($message)
            ->meta([
                'sender_id' => $message['user_id'] ?? null,
            ])
            ->sync();

        //self::publish()

        return $result;
    }

    static function getRecentChats(User $user)
    {
        $userID      = $user->id;
        $recentChats = $user
            ->userChat()
            ->with('chatChannel:id,channel_name')
            ->where('last_message_ts', '>', 0)
            ->where('user_id', $userID)
            ->orderByDesc('last_message_ts')
            ->limit(100)
            ->get();

        $channelNames = $recentChats->pluck('chatChannel.channel_name')->all();

        /** @var Collection $channelInterlocutors */
        $channelInterlocutors = ChatChannel
            ::with(['user' => function (HasManyThrough $b) use ($user) {
                $b->where($b->qualifyColumn('id'), '<>', $user->id);
                $b->select($b->qualifyColumn('id'), $b->qualifyColumn('display_name'), $b->qualifyColumn('company_id'));
            }])
            ->whereHas('user', function (EloquentBuilder $b) use ($user) {
                $b->where($b->qualifyColumn('id'), '<>', $user->id);
                $b->limit(1);
            })
            ->with(['userChat' => function (HasMany $b) use ($user) {
                $b->where($b->qualifyColumn('user_id'), '<>', $user->id);
            }])
            ->byName($channelNames)
            ->limit(100)
            ->get(['id'])
            ->keyBy('id');

        $result = $recentChats->reduce(function ($accumulator, UserChat $chat) use ($channelInterlocutors) {
            if (!$accumulator) $accumulator = [];
            $chat->setVisible(['readed_at']);
            if (!$latestChannelMessage = $chat->latestChannelMessage) {
                return $accumulator;
            }

            $item                           = array_merge($chat->attributesToArray(), $chat->getRelations(), compact('latestChannelMessage'));
            $item['interlocutor_readed_at'] = 0;

            if ($channelInterlocutors->has($chat->channel_id)) {
                /** @var ChatChannel $channelInterlocutor */
                $channelInterlocutor = $channelInterlocutors[$chat->channel_id];
                $user                = $channelInterlocutor->user->first();
                $user->append(['avatar']);
                $user->setVisible(['avatar', 'channel_id', 'display_name', 'id']);
                $userChat            = $channelInterlocutor->userChat->first();
                if ($userChat && $user && $user->isSalesConsultant()) {
                    $item['interlocutor_readed_at'] = $userChat->readed_at;
                    $item['user']                   = $user;
                    $accumulator[]                  = $item;
                }
            }

            return $accumulator;
        });

        return $result ? $result : [];
    }

    /**
     * @param array $userIds
     * @return ChatChannel
     */
    static function createOrFindPrivateUsersChannel(array $userIds)
    {
        $channel = ChatChannel::byUsers($userIds)->first();
        if (!$channel) {
            $channel               = new ChatChannel;
            $channel->channel_name = 'private-' . Str::random(32);
            $channel->save();
            foreach ($userIds as $userId) {
                UserChat::firstOrCreate([
                    'user_id'    => $userId,
                    'readed_at'  => 0,
                    'channel_id' => $channel->id
                ]);
            }
        }

        return $channel;
    }

    /**
     * @param $authUser
     * @param $channelName
     * @return User
     */
    static function getChannelInterlocutor(User $authUser, $channelName)
    {
        return User
            ::whereHas('chatChannel', function ($b) use ($channelName) {
                $b->byName($channelName);
            })
            ->with('company')
            ->where('id', '<>', $authUser->id)
            ->limit(1)
            ->get(['id', 'display_name', 'company_id'])
            ->first();
    }

    /**
     * @param User $user
     * @return string
     */
    static function getSystemChannelName(User $user)
    {
        return 'common-' . $user->user_unique_id;
    }

    static function sendNewChannelNotification(UserChat $chat)
    {
        $channel = [$chat->chatChannel->channel_name];
        $type    = 'new_channel';

        $result = self::pubNub()
            ->publish()
            ->channel(self::getSystemChannelName($chat->user))
            ->message(compact('channel', 'type'))
            ->sync();

        return $result;
    }

    /**
     * @param string $channelName
     * @param User $user
     * @param int $readedAtTime
     * @return \PubNub\Models\Consumer\PNPublishResult
     */
    static function sendChannelReadNotification($channelName, User $user, $readedAtTime)
    {
        $type = 'channel_read';

        $channels[] = [
            'channel' => $channelName,
            'time'    => $readedAtTime
        ];
        $result     = self::pubNub()
            ->publish()
            ->channel(self::getSystemChannelName($user))
            ->message(compact('channels', 'type'))
            ->meta(['unread_messages' => UserChat::countUnreadMessages($user)])
            ->sync();

        return $result;
    }

    static function sendUnreaMessagesNotification(User $user)
    {
        $type = 'unread_messages';
        $unread_messages = UserChat::countUnreadMessages($user);

        self::pubNub()
            ->publish()
            ->channel(self::getSystemChannelName($user))
            ->message(compact('type', 'unread_messages'))
            ->sync();
    }

}
