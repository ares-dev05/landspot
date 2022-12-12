<?php

namespace App\Listeners;

use App\Events\PasswordChanged;
use App\Models\User;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;

class SendPasswordChangedNotification
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
     * @param  PasswordChanged $event
     * @return void
     */
    public function handle(PasswordChanged $event)
    {
        $user = $event->user;
        Mail::send(
            'emails.password-changed',
            [
                'name' => $user->display_name
            ],
            function (Message $msg) use ($user) {

                $msg->from(config('mail.from.address'), config('mail.from.name'))
                    ->subject('Account password changed');

                $msg->to($user->email, $user->display_name);
            }
        );
    }
}
