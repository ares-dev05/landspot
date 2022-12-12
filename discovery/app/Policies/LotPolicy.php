<?php

namespace App\Policies;

use App\Models\InvitedUser;
use App\Models\Lot;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Collection;

class LotPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the lot.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Lot  $lot
     * @return mixed
     */
    public function view(User $user, Lot $lot)
    {
        return false;
    }

    /**
     * @param InvitedUser $user
     * @param Lot $lot
     * @return boolean
     */
    public function viewByInvitedUser(InvitedUser $user, Lot $lot)
    {
        $stage = $lot->stage;
        $estate = $stage->estate;

        if ($stage->published == 1){
            return Lot::getFilteredCollection(['lotmix' =>  true , 'estate_id' => $estate->id],new Collection())->contains('id', $lot->id);
        }
        return false;
    }

    /**
     * Determine whether the user can create lots.
     *
     * @param  \App\Models\User  $user
     * @return mixed
     */
    public function create(User $user)
    {
        return false;
    }

    /**
     * Determine whether the user can add lot packages to the lot.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Lot  $lot
     * @return mixed
     */
    public function updateLotPackages(User $user, Lot $lot)
    {
        return $user->can('updateLotPackages', $lot->stage->estate);
    }

    /**
     * Determine whether the user can update the lot.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Lot  $lot
     * @return mixed
     */
    public function update(User $user, Lot $lot)
    {
        $estate = $lot->stage->estate;
        return $user->estate->contains($estate) &&
            ($user->isLandDeveloper() ||
                $user->isGlobalEstateManager() ||
                ($estate->checkPermission(Permission::ListManager, $user->id) ||
                    $estate->checkPermission(Permission::PriceEditor, $user->id)));
    }

    /**
     * Determine whether the user can delete the lot.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Lot  $lot
     * @return mixed
     */
    public function delete(User $user, Lot $lot)
    {
        $estate = $lot->stage->estate;
        return $user->estate->contains($estate) &&
            ($user->isLandDeveloper() ||
                $user->isGlobalEstateManager() ||
                ($estate->checkPermission(Permission::ListManager, $user->id) ||
                    $estate->checkPermission(Permission::PriceEditor, $user->id)));
    }
}
