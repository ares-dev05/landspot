<?php

namespace App\Policies;

use App\Models\Builder;
use App\Models\User;
use App\Models\UserGroup;
use Illuminate\Auth\Access\HandlesAuthorization;

class PdfManagerPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the current user profile.
     *
     * @param  \App\Models\Builder $user
     * @param  \App\Models\User $authUser
     * @return mixed
     */
    public function view(User $authUser, Builder $user)
    {
        return ($authUser->isBuilderAdmin() && $authUser->company_id == $user->company_id);
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  \App\Models\User $user
     * @param  \App\Models\User $authUser
     * @return mixed
     */
    public function update(User $authUser, User $user)
    {
        return ($authUser->isBuilderAdmin() && $authUser->company_id == $user->company_id);
    }
}
