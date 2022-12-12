<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;

class PhoneChanged
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /** @var User $user */
    public $user;

    public function __construct($user)
    {
        $this->user = $user;
    }
}
