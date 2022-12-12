<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Range;
use App\Models\UserGroup;
use Illuminate\Auth\Access\HandlesAuthorization;

class RangePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the range.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Range  $range
     * @return mixed
     */
    public function view(User $user, Range $range)
    {
        return $user->company->range->contains($range) && $user->state_id == $range->state_id;
    }

    public function viewSitingRange(User $user, Range $r)
    {
        return $user->company_id == $r->cid;
    }

    /**
     * Determine whether the user can create ranges.
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
     * Determine whether the user can add the lots to the stage.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Range  $range
     * @return mixed
     */
    public function createHouse(User $user, Range $range)
    {
        return $user->company->id == $range->builderCompany->id &&
            (
                ($user->isBuilderAdmin() || $user->isDiscoveryManager()) &&
                $user->state_id == $range->state_id
            );
    }

    /**
     * Determine whether the user can update the range.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Range  $range
     * @return mixed
     */
    public function update(User $user, Range $range)
    {
        return $user->company->id == $range->builderCompany->id &&
            (
                ($user->isBuilderAdmin() || $user->isDiscoveryManager()) &&
                $user->state_id == $range->state_id
            );
    }

    /**
     * Determine whether the user can delete the range.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Range  $range
     * @return mixed
     */
    public function delete(User $user, Range $range)
    {
        //
    }
}
