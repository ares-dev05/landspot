<?php

namespace App\Events;

use App\Models\Estate;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class EstateCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /** @var Estate $estate */
    public $estate;
    public $user;

    public function __construct(Estate $estate, User $user)
    {
        $this->estate = $estate;
        $this->user = $user;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
//    public function broadcastOn()
//    {
//        return new PrivateChannel('channel-name');
//    }
}
