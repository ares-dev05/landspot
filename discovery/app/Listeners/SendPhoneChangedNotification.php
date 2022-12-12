<?php

namespace App\Listeners;

use App\Events\PhoneChanged;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;

class SendPhoneChangedNotification
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
     * @param  PhoneChanged $event
     * @return void
     */
    public function handle(PhoneChanged $event)
    {
        $user = $event->user;
        Mail::send(
            'emails.phone-changed',
            [
                'name' => $user->display_name,
                'phone' => $user->phone,
            ],
            function (Message $msg) use ($user) {

                $msg->from(config('mail.from.address'), config('mail.from.name'))
                    ->subject('You phone was changed');

                $msg->to($user->email, $user->display_name);
            }
        );
    }
}
