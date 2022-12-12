<?php

namespace App\Listeners;

use App\Models\BlacklistEmail;
use Illuminate\Mail\Events\MessageSending;

class CheckEmailPreferences
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
    }

    /**
     * Handle the event.
     *
     * @param MessageSending $event
     * @return false
     */
    public function handle(MessageSending $event)
    {
        //TODO: delete invalid email from to array
        $recipients = $event->message->getTo();
        if (BlacklistEmail::whereIn('email', array_keys($recipients))->exists()) {
            return false;
        }
    }
}
