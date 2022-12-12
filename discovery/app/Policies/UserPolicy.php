<?php

namespace App\Policies;

use App\Models\ChatModel;
use App\Models\User;
use App\Models\UserGroup;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the current user estates permissions.
     *
     * @param  \App\Models\User $user
     * @param  \App\Models\User $authUser
     * @return mixed
     */
    public function view(User $authUser, User $user)
    {
        return ($authUser->isLandDeveloper() && $authUser->company_id == $user->company_id) ||
            ($authUser->isUserManager() && $authUser->state_id == $user->state_id && $authUser->company_id == $user->company_id);
    }

    /**
     * Determine whether the user can view the current user profile.
     *
     * @param  \App\Models\User $user
     * @param  \App\Models\User $authUser
     * @return mixed
     */
    public function viewProfile(User $authUser, User $user)
    {
        return $authUser->id == $user->id;
    }

    /**
     * Determine whether the user can update the current user profile.
     *
     * @param  \App\Models\User $user
     * @param  \App\Models\User $authUser
     * @return mixed
     */
    public function updateProfile(User $authUser, User $user)
    {
        return $authUser->id == $user->id;
    }

    /**
     * Determine whether the user can view the current user profile.
     *
     * @param  \App\Models\User $authUser
     * @return mixed
     */
    public function viewAsGlobalAdmin(User $authUser)
    {
        return $authUser->isGlobalAdmin();
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  \App\Models\User $user
     * @return mixed
     */
    public function create(User $user)
    {
        $isBuilderCompany = $user->company->isBuilder();
        $companyAccess = $user->company->chas_discovery == 1 && $user->company->chas_footprints == 0;

        return $isBuilderCompany
            ? $user->isBuilderAdmin() || $companyAccess && $user->isUserManager()
            : $user->isLandDeveloper() || $user->isUserManager();
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
        $isBuilderCompany = $authUser->company->isBuilder();
        $companyAccess = $authUser->company->chas_discovery == 1 && $authUser->company->chas_footprints == 0;

        return $isBuilderCompany
            ? $authUser->isBuilderAdmin() || $companyAccess && ($authUser->isUserManager() &&
                $authUser->state_id == $user->state_id && $authUser->company_id == $user->company_id)
            : ($authUser->isLandDeveloper() && $authUser->company_id == $user->company_id) ||
            ($authUser->isUserManager() && $authUser->state_id == $user->state_id && $authUser->company_id == $user->company_id);
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  \App\Models\User $user
     * @param  \App\Models\User $authUser
     * @return mixed
     */
    public function delete(User $authUser, User $user)
    {
        $isBuilderCompany = $authUser->company->isBuilder();
        $companyAccess = $authUser->company->chas_discovery == 1 && $authUser->company->chas_footprints == 0;

        return $isBuilderCompany
            ? $authUser->isBuilderAdmin() || $companyAccess && ($authUser->isUserManager() &&
                $authUser->state_id == $user->state_id && $authUser->company_id == $user->company_id)
            : ($authUser->isLandDeveloper() && $authUser->company_id == $user->company_id) ||
            ($authUser->isUserManager() && $authUser->state_id == $user->state_id && $authUser->company_id == $user->company_id);
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param \App\Models\User $authUser
     * @return mixed
     */
    public function restore(User $authUser)
    {
        return $authUser->isGlobalAdmin();
    }

    /**
     * Determine whether the user can chare client.
     *
     * @param  \App\Models\User $user
     * @param  \App\Models\User $authUser
     * @return mixed
     */
    function shareClient(User $authUser, User $user)
    {
        $companyAdmin = $authUser->isBuilderAdmin();
        return $authUser->company->isBuilder() &&
            (
                ($authUser->company_id == $user->company_id && $companyAdmin) ||
                ($authUser->company_id == $user->company_id && $authUser->state_id == $user->state_id)
            );
    }

    function canChat(User $authUser, User $user)
    {
        return ChatModel::hasInContacts($authUser, $user);
    }
}
