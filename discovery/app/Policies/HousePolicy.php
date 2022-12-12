<?php

namespace App\Policies;

use App\Models\InvitedUser;
use App\Models\User;
use App\Models\House;
use App\Models\UserGroup;
use Illuminate\Auth\Access\HandlesAuthorization;

class HousePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the house.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\House  $house
     * @return mixed
     */
    public function view(User $user, House $house)
    {
        $house = clone $house;
        $rangeCompany = optional($house->range)->builderCompany;

        return $rangeCompany ? $user->builderCompany()->get()->contains($house->range->builderCompany) : false;
    }

    /**
     * @param InvitedUser $user
     * @param House $house
     * @return bool
     */
    public function viewByInvitedUser(InvitedUser $user, House $house)
    {
        $house = clone $house;
        $rangeCompany = optional($house->range)->builderCompany;

        return $rangeCompany ? array_key_exists($rangeCompany->id, $user->getBuilderCompanies()) : false;
    }

    /**
     * Determine whether the user can create houses.
     *
     * @param  \App\Models\User  $user
     * @return mixed
     */
    public function create(User $user)
    {
        return $user->company->type == 'builder' &&
            ($user->isBuilderAdmin() ||
                $user->isDiscoveryManager());
    }

    /**
     * Determine whether the user can update the house.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\House  $house
     * @return mixed
     */
    public function update(User $user, House $house)
    {
        $house = clone $house;
        return $user->company->id == $house->range->builderCompany->id &&
            (
                ($user->isBuilderAdmin() || $user->isDiscoveryManager()) &&
                $user->state_id == $house->range->state_id
            );
    }

    /**
     * Determine whether the user can delete the house.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\House  $house
     * @return mixed
     */
    public function delete(User $user, House $house)
    {
        $house = clone $house;
        return $user->company->id == $house->range->builderCompany->id &&
            (
                ($user->isBuilderAdmin() || $user->isDiscoveryManager()) &&
                $user->state_id == $house->range->state_id
            );
    }
}
