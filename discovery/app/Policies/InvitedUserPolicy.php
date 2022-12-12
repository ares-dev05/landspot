<?php

namespace App\Policies;

use App\Models\InvitedUser;
use Illuminate\Auth\Access\HandlesAuthorization;

class InvitedUserPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can update the current user profile.
     *
     * @param  \App\Models\InvitedUser $user
     * @param  \App\Models\InvitedUser $authUser
     * @return mixed
     */
    public function updateProfile(InvitedUser $authUser, InvitedUser $user)
    {
        return $authUser->id == $user->id;
    }
    /**
     * Determine whether the user can update the current user profile.
     *
     * @param  $authUser
     * @param  \App\Models\InvitedUser $invitedUser
     * @return mixed
     */
    public function editByUser($authUser, InvitedUser $invitedUser)
    {
        return $authUser->invitedUser->contains($invitedUser->id);
    }
}
