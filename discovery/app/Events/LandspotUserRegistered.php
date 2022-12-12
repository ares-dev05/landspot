<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LandspotUserRegistered
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userData;

    /**
     * Create a new event instance.
     *
     * @param array $userData
     */
    public function __construct(array $userData)
    {
        $this->userData = $userData;
    }
}
