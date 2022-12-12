<?php

namespace App\Policies\Sitings;

use App\Models\Sitings\{
    Siting
};
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class SitingPolicy
{
    use HandlesAuthorization;

    function view(User $user, Siting $siting)
    {
        return $user->id == $siting->user_id
            || $user->sharedSiting->contains('siting_id', $siting->id)
            || $siting->user->company_id == $user->company_id;
    }

    function update(User $user, Siting $siting)
    {
        return $user->id == $siting->user_id
            || $user->sharedSiting->contains('siting_id', $siting->id)
            || $siting->user->company_id == $user->company_id;
    }

    function create(User $user)
    {
        return true;
    }

    /**
     * Determine whether the user can update the current user profile.
     *
     * @param  $authUser
     * @param Siting $siting
     * @return mixed
     */
    public function editByUser($authUser, Siting $siting)
    {
        return $authUser->siting->contains($siting)
            || $authUser->sharedSiting->contains('siting_id', $siting->id)
            || $siting->user->company_id == $authUser->company_id;
    }

}
