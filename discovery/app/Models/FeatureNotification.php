<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class FeatureNotification
 * @property int id
 * @property int sent_timestamp
 * @property string title
 * @property string content
 *
 * @method static FeatureNotification firstOrCreate($id)
 * @method static FeatureNotification findOrFail($id)
 * @property Company companies
 * @property User userNotification
 */
class FeatureNotification extends Model
{
    protected $dateFormat = 'U';
    public $timestamps = true;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'title', 'content', 'sent_timestamp'
    ];

    /**
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $dates = [
        'sent_timestamp',
    ];

    /**
     * Return a timestamp as DateTime object.
     *
     * Extended to allow saving empty date values as NULL in the database.
     *
     * @param  mixed $value
     *
     * @return \Carbon\Carbon
     */
//    protected function asDateTime($value)
//    {
//        if (empty($value)) {
//            return null;
//        }
//
//        return parent::asDateTime($value);
//    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function (FeatureNotification $featureNotification) {
            $featureNotification->companies()->detach();
            $featureNotification->userNotification()->each(function (UserNotification $userNotification) {
                $userNotification->forceDelete();
            });
        });
    }

    public function companies()
    {
        return $this->morphToMany(Company::class, 'notification', 'company_notification');
    }

    public function states()
    {
        return $this->morphToMany(State::class, 'notification', 'notification_state');
    }

    public function userNotification()
    {
        return $this->morphMany(UserNotification::class, 'notification')->withTrashed();
    }
}
