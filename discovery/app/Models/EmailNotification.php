<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailNotification extends Model
{
    protected $table    = 'email_notifications';
    public $timestamps  = false;
    protected $fillable = [
        'enabled',
        'notification_user_id',
        'sent_at',
        'type',
        'value'
    ];
    protected $casts    = [
        'value' => 'json'
    ];

    const chatNotificationDelays = [
        3600, 86400, 3 * 86400, 7 * 86400, 14 * 86400, 30 * 86400
    ];

    protected $attributes = ['enabled' => 1];

    const typeNewChatMessages     = 'new_chat_messages';
    const typeLotsWithoutPackages = 'lots_without_packages';

    function user()
    {
        return $this->belongsTo(User::class, 'notification_user_id');
    }
}
