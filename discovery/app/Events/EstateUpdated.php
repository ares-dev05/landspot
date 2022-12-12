<?php

namespace App\Events;

use App\Models\Estate;
use App\Models\Lot;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class EstateUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $estateId;
    public $lotVisibility;

    /**
     * Create a new event instance.
     *
     * @param Estate $estate
     * @param integer $lotVisibility
     * @return void
     */
    public function __construct(Estate $estate, $lotVisibility = Lot::visibility['all'])
    {
        $this->estateId = $estate->id;
        $this->lotVisibility = $lotVisibility;

        $this->dontBroadcastToCurrentUser();
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new Channel('estate.'.$this->estateId);
    }
}
