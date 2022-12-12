<?php

namespace App\Listeners;

use App\Events\LandspotUserRegistered;
use App\Models\HouseState;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;

class SendRegisteredUserNotification
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
     * @param  LandspotUserRegistered $event
     * @return void
     */
    public function handle(LandspotUserRegistered $event)
    {
        $userData = $event->userData;
        $stateId = $userData['state_id'] ?? null;
        $stateName = $stateId ? HouseState::findOrFail($stateId)->name : null;

        $subject = $userData['type'] === 'developer'
            ? 'A new developer'
            : 'A new builder';

        $subject .= ' wants to register on ' . config('app.name');

        Mail::send('emails.new-user-details',
            compact('userData', 'stateName'),
            function (Message $msg) use ($subject) {
                $msg->from(config('mail.from.address'), config('mail.from.name'))
                    ->to('support@landconnect.com.au')
                    ->subject($subject);
            }
        );

    }
}
