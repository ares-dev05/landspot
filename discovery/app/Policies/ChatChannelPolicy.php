<?php

namespace App\Policies;

use App\Models\ChatChannel;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ChatChannelPolicy
{
    use HandlesAuthorization;

    /**
     * Create a new policy instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

//    public function update(User $user, ChatChannel $chatChannel) {
//        return $chatChannel->user_id == $user->id;
//    }
}
