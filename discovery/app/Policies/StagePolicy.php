<?php

namespace App\Policies;

use App\Models\Permission;
use App\Models\User;
use App\Models\Stage;
use App\Models\UserGroup;
use Illuminate\Auth\Access\HandlesAuthorization;

class StagePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the stage.
     *
     * @param \App\Models\User $user
     * @param \App\Models\Stage $stage
     * @return mixed
     */
    public function view(User $user, Stage $stage)
    {
        $estate = $stage->estate;

        return $user->estate->contains($estate) && (
                $user->company->isDeveloper() ||
                $user->company->isBuilder() && $stage->published
            );
    }

    /**
     * Determine whether the user can create stages.
     *
     * @param \App\Models\User $user
     * @return mixed
     */
    public function create(User $user)
    {
        //
    }

    /**
     * Determine whether the user can update the stage.
     *
     * @param \App\Models\User $user
     * @param \App\Models\Stage $stage
     * @return mixed
     */
    public function update(User $user, Stage $stage)
    {
        $estate = $stage->estate;
        return $user->estate->contains($estate) &&
            ($user->isLandDeveloper() ||
                $user->isGlobalEstateManager() ||
                ($estate->checkPermission(Permission::ListManager, $user->id) ||
                    $estate->checkPermission(Permission::PriceEditor, $user->id)));
    }

    /**
     * Determine whether the user can add the lots to the stage.
     *
     * @param \App\Models\User $user
     * @param \App\Models\Stage $stage
     * @return mixed
     */
    public function createLots(User $user, Stage $stage)
    {
        $estate = $stage->estate;
        return $user->estate->contains($estate) &&
            ($user->isLandDeveloper() ||
                $user->isGlobalEstateManager() ||
                ($estate->checkPermission(Permission::ListManager, $user->id) ||
                    $estate->checkPermission(Permission::PriceEditor, $user->id)));
    }

    /**
     * Determine whether the user can delete the stage.
     *
     * @param \App\Models\User $user
     * @param \App\Models\Stage $stage
     * @return mixed
     */
    public function delete(User $user, Stage $stage)
    {
        $estate = $stage->estate;
        return $user->estate->contains($estate) &&
            ($user->isLandDeveloper() ||
                $user->isGlobalEstateManager() ||
                ($estate->checkPermission(Permission::ListManager, $user->id) ||
                    $estate->checkPermission(Permission::PriceEditor, $user->id)));
    }

    //TODO:change permission to necessary
    /**
     * @param User $user
     * @param Stage $stage
     * @return bool
     */
    public function createFormula(User $user, Stage $stage)
    {
        return $user->isGlobalAdmin();
    }

    //TODO:change permission to necessary
    /**
     * @param User $user
     * @param Stage $stage
     * @return bool
     */
    public function destroyFormula(User $user, Stage $stage)
    {
        return $user->isGlobalAdmin();
    }
}
