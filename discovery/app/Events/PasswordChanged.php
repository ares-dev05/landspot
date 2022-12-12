<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;

class PasswordChanged
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /** @var User $user */
    public $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }
}
