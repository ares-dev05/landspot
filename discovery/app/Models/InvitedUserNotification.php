<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class InvitedUserNotification
 * @property int id
 * @property int invited_user_id
 * @property int lotmix_notification_id
 * @property int deleted_at
 * @property int read_at
 *
 * @method static UserNotification firstOrCreate($id)
 * @method static UserNotification findOrFail($id)
 * @property User users
 */
class InvitedUserNotification extends Model
{
    use SoftDeletes;

    protected $dateFormat = 'U';
    public $timestamps = false;

    protected $fillable = [
        'invited_user_id', 'lotmix_notification_id', 'deleted_at', 'read_at'
    ];

    protected $hidden = ['lotmix_notification_id', 'deleted_at', 'read_at'];
    /**
     * The relations to eager load on every query.
     *
     * @var array
     */
    protected $appends = ['lotmix_notification'];

    function user()
    {
        return $this->belongsTo(InvitedUser::class);
    }

    function lotmixNotification()
    {
        return $this->belongsTo(LotmixNotification::class);
    }

    function getLotmixNotificationAttribute()
    {
        return $this->lotmixNotification()->first([
            'id',
            'title',
            'content'
        ]);
    }

    /**
     * @param EloquentBuilder $b
     * @return EloquentBuilder
     */
    function scopeUnread(EloquentBuilder $b)
    {
        return $b->whereNull('read_at');
    }

    /**
     * @param EloquentBuilder $b
     * @param int $id
     * @return EloquentBuilder
     */
    function scopeByInvitedUserId(EloquentBuilder $b, $id)
    {
        return $b->where('invited_user_id', $id);
    }
}
