<?php

namespace App\Events;

use App\Models\Estate;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;

class EstateApproved
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /** @var Estate $estate */
    public $estate;

    public function __construct(Estate $estate)
    {
        $this->estate = $estate;
    }
}
