<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
/**
 * Class LotmixNotification
 * @property int id
 * @property string title
 * @property string content
 * @property Stage stage
 */
class LotmixNotification extends Model
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

    public function invitedUserNotification()
    {
        return $this->hasMany(InvitedUserNotification::class);
    }
}
