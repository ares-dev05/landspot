<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;

/**
 * Class UserNotification
 * @property int id
 * @property int user_id
 * @property int notification_id
 * @property int deleted_at
 * @property int read_at
 * @property string notification_type
 *
 * @method static UserNotification firstOrCreate($id)
 * @method static UserNotification findOrFail($id)
 * @property Company companies
 * @property User users
 */
class UserNotification extends Model
{
    use SoftDeletes;

    protected $dateFormat = 'U';
    public $timestamps = false;
    protected $table = 'user_notification';


    protected $fillable = [
        'user_id', 'notification_id', 'notification_type', 'deleted_at', 'read_at'
    ];

    protected $hidden = ['notification_id', 'notification_type', 'deleted_at', 'read_at'];

    /**
     * The relations to eager load on every query.
     *
     * @var array
     */
    protected $appends = ['notification'];

    /**
     * Get all of the owning notification models.
     */
    public function notification()
    {
        return $this->morphTo();
    }

    function user()
    {
        return $this->belongsTo(User::class);
    }

    function getNotificationAttribute()
    {
        return $this->notification()->first([
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
    function scopeByUserId(EloquentBuilder $b, $id)
    {
        return $b->where('user_id', $id);
    }
}
