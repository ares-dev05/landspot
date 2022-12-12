<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Support\Collection;

/**
 * Class ChatChannel
 * @property int id
 * @property string channel_name
 * @property User user
 * @property UserChat userChat
 * @property array lastChannelMessage
 */
class ChatChannel extends Model
{
    const channelLastMessagesCountLimit = 100;

    protected $table = 'chat_channels';
    protected $dateFormat = 'U';

    protected $fillable = [
        'channel_name',
    ];

    protected $casts = ['created_at' => 'integer'];
    protected $hidden = ['updated_at'];

    public function user()
    {
        return $this->hasManyThrough(User::class, UserChat::class, 'channel_id', 'id', 'id', 'user_id');
    }

    function userChat()
    {
        return $this->hasMany(UserChat::class, 'channel_id');
    }

    //Scopes

    function scopeByName(EloquentBuilder $b, $channelName)
    {
        return is_array($channelName)
            ? $b->whereIn('channel_name', $channelName)
            : $b->where('channel_name', $channelName);
    }

    function scopeByUsers(EloquentBuilder $b, $users)
    {
        foreach($users as $userId) {
            $b->whereHas('user', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            });
        }
        $b->whereHas('user', function($q) {}, '=', count($users));
        return $b;
    }

    //Accessors

    function getReadedAtAttribute()
    {
        $authUser = auth()->user();
        $chat     = $this->userChat->filter(function (UserChat $item) use ($authUser) {
            return $item->user_id == $authUser->id;
        });

        return $chat ? $chat->first()->readed_at : 0;
    }

    /**
     * @return array
     */
    function getLastChannelMessageAttribute()
    {
        return ChatModel::getChannelHistory($this->channel_name, self::channelLastMessagesCountLimit);
    }

    /**
     * @param int $count
     * @param int $start
     * @param int $end
     * @param int $reverse
     * @return array
     */
    function getChannelHistoryMessages($count = self::channelLastMessagesCountLimit, $start = null, $end = null, $reverse = null)
    {
        return ChatModel::getChannelHistory(
            $this->channel_name,
            $count,
            $start,
            $end,
            $reverse
        );
    }

    /**
     * @param array $message
     * @throws \Exception
     */
    function publishMessage(array $message)
    {
        $senderUserId = auth()->id();
        try {
            $result    = ChatModel::publishMessage($this, $message);
            $timetoken = $result->getTimetoken();

            if ($timetoken) {
                UserChat::byChannel($this->id)->update([
                    'last_message_ts' => $message['created_at'],
                ]);
                UserChat::byChannel($this->id)
                    ->where('user_id', '<>', $senderUserId)->first()
                    ->increment('unread_messages', 1);
            }

            $this->userChat()->each(function (UserChat $chat) use ($senderUserId) {
                if ($senderUserId != $chat->user_id) {
                    ChatModel::sendUnreaMessagesNotification($chat->user);
                }
            });
        } catch (\Exception $e) {
            throw $e;
        }
    }
}
