<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Support\Collection;

/**
 * Class UserChat
 * @property int id
 * @property int user_id
 * @property int readed_at
 * @property string channel_id
 * @property User user
 * @property ChatChannel chatChannel
 */
class UserChat extends Model
{
    protected $table = 'user_chats';
    protected $dateFormat = 'U';

    public $timestamps = false;

    protected $fillable = [
        'user_id', 'channel_id', 'readed_at', 'last_message_ts', 'last_message_id', 'unread_messages'
    ];

    protected $hidden = ['last_message_ts', 'last_message_id', 'unread_messages'];

    protected $guarded = ['last_message_ts', 'last_message_id'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function channelMessage()
    {
        return $this->chatChannel->lastChannelMessage;
    }

    function getLatestChannelMessageAttribute()
    {
        return ChatModel::getChannelHistory($this->chatChannel->channel_name, 1)[0] ?? false;
    }

    function chatChannel()
    {
        return $this->belongsTo(ChatChannel::class, 'channel_id');
    }

    function scopeByUserId(EloquentBuilder $b, $userID, $operator = '=')
    {
        return $b->where('user_id', $operator ,$userID);
    }

    function scopeByChannel(EloquentBuilder $b, $channelId)
    {
        return $b->where('channel_id', $channelId);
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function (UserChat $chat) {
            ChatModel::grantChannels([$chat->chatChannel->channel_name], $chat->user);
        });

        static::created(function (UserChat $chat) {
            ChatModel::sendNewChannelNotification($chat);
        });
    }

    /**
     * @return int UnixTime
     */
    function updateReadAtTime()
    {
        $time = time();
        $this->getQuery()
            ->where([
                'user_id'    => $this->user_id,
                'channel_id' => $this->channel_id
            ])->update([
                'readed_at'       => $time,
                'unread_messages' => 0
            ]);

        return $time;
    }

    /**
     * @param User $user
     * @return int
     */
    static function countUnreadMessages($user)
    {
        $qb = UserChat::getQuery();

        return (int)$qb
            ->select(\DB::raw('IFNULL(SUM(unread_messages),0) as count_messages'))
            ->where('user_id', $user->id)
            ->first()
            ->count_messages;
    }
}
