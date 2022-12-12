<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserDisabledEmailNotification extends Model
{
    protected $table    = 'users_disabled_email_notifications';
    public $timestamps  = false;

    protected $fillable = ['notification_user_id'];

    function user()
    {
        return $this->belongsTo(User::class, 'notification_user_id');
    }
}
