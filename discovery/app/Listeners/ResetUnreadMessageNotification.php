<?php

namespace App\Listeners;

use App\Models\EmailNotification;
use App\Models\User;
use Illuminate\Auth\Events\Login;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;

class ResetUnreadMessageNotification
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param Login $event
     * @return void
     */
    public function handle(Login $event)
    {

        /** @var User $user */
        $user         = $event->user;
        $notification = $user->emailNotifications()->where([
            'type'    => EmailNotification::typeNewChatMessages,
            'enabled' => 1
        ])->first();

        if ($notification) $notification->update([
            'sent_at' => 0,
            'value'   => null
        ]);
    }
}
