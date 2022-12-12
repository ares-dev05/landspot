<?php

namespace App\Listeners;

use App\Events\TwoFAStateChanged;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;

class SendTwoFAStateNotification
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
     * @param  TwoFAStateChanged $event
     * @return void
     */
    public function handle(TwoFAStateChanged $event)
    {
        $user = $event->user;

        Mail::send(
            'emails.twofa-changed',
            [
                'name' => $user->display_name,
                'TWOFA_ACTIVE' => $user->twofa_secret != '',
            ],
            function (Message $msg) use ($user) {

                $msg->from(config('mail.from.address'), config('mail.from.name'))
                    ->subject('Two-factor authorization of your account');

                $msg->to($user->email, $user->display_name);
            }
        );
    }
}
