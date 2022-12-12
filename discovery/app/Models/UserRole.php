<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\Model;

/**
 * Class UserRole
 * @property int user_id
 * @property int role
 * @property User user
 * @method UserRole find(...$args)
 */
class UserRole extends Model
{
    const USER_ROLES = [
        'Sales Consultant' => 1,
        'Sales Manager'    => 2,
        'Other'            => 3
    ];

    protected $table = 'user_roles';

    protected $fillable = [
        'user_id', 'role'
    ];

    public $timestamps = false;

    function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @param EloquentBuilder $b
     * @return EloquentBuilder
     */
    function scopeSalesConsultants(EloquentBuilder $b)
    {
        return $b->where('role', self::USER_ROLES['Sales Consultant']);
    }

    protected static function boot()
    {
        parent::boot();

        static::deleted(function (UserRole $r) {
            if ($r->role == static::USER_ROLES['Sales Consultant']) {
                static::resetUnreadMessagesCount($r->user);
            }
        });

        static::updated(function (UserRole $r) {
            $id = static::USER_ROLES['Sales Consultant'];
            if ($r->getAttributeFromArray('role') != $id && $r->getOriginal('role') == $id) {
                static::resetUnreadMessagesCount($r->user);
            }
        });
    }

    protected static function resetUnreadMessagesCount(User $senderUser)
    {
        $channels = $senderUser->chatChannel()->get(['channel_id'])->pluck('channel_id');
        UserChat::whereIn('channel_id', $channels)
                ->where('user_id', '<>', $senderUser->id)
                ->update(['unread_messages' => 0]);
    }
}
