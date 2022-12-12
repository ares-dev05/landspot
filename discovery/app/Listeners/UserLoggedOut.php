<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Logout;

class UserLoggedOut
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
     * @param  Logout $event
     * @return void
     */
    public function handle(Logout $event)
    {
        if (method_exists($event->user, 'cleanCacheVariables')) {
            $event->user->cleanCacheVariables();
        }
    }
}
