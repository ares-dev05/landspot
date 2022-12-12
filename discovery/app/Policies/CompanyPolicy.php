<?php

namespace App\Policies;

use App\Models\LotmixStateSettings;
use App\Models\User;
use App\Models\Company;
use App\Models\InvitedUser;
use App\Models\UserGroup;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;

class CompanyPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the company.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Company  $company
     * @return mixed
     */
    public function view(User $user, Company $company)
    {
        return $user->company->id == $company->id;
    }
    /**
     * Determine whether the user can view the company.
     *
     * @param  \App\Models\InvitedUser  $user
     * @param  \App\Models\Company  $company
     * @return mixed
     */
    public function viewByInvitedUser(InvitedUser $user, Company $company)
    {
        $companies = $user->getMyLotmixCompanies();
        return $companies->contains('id',$company->id);
    }
    /**
     * Determine whether the user can enquire.
     *
     * @param  \App\Models\InvitedUser  $user
     * @param  \App\Models\Company  $company
     * @return mixed
     */
    public function canSendEnquire(InvitedUser $user, Company $company)
    {
        $companies = $user->getBuilderCompanies();
        return in_array($company->id, array_keys($companies));
    }

    /**
     * Determine whether the user can create companies.
     *
     * @param  \App\Models\User  $user
     * @return mixed
     */
    public function create(User $user)
    {
        //
    }

    /**
     * Determine whether the user can update the company.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Company  $company
     * @return mixed
     */
    public function update(User $user, Company $company)
    {
        return $user->company->id == $company->id && $user->isBuilderAdmin() || $user->isDiscoveryManager();
    }

    /**
     * Determine whether the user can create estate in the company.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Company  $company
     * @return mixed
     */
    public function createEstate(User $user, Company $company)
    {
        return $user->company->id == $company->id && ($user->isLandDeveloper() ||
                $user->isGlobalEstateManager());
    }

    /**
     * @param  \App\Models\User  $user
     * @param  \App\Models\Company  $company
     * @return mixed
     */
    public function updateClientDocuments(User $user, Company $company)
    {
        return $user->company->id == $company->id &&
            (
                $company->isDeveloper() ||
                (
                    $company->isBuilder() &&
                    $company->chas_lotmix &&
                    $user->state->getLotmixAccess($company) == LotmixStateSettings::LOTMIX_ACCESS_ENABLED
                )
            );
    }

    /**
     * @param  \App\Models\User  $user
     * @param  \App\Models\Company  $company
     * @return mixed
     */
    public function updateFloorplanShortList(User $user, Company $company)
    {
        return $user->company->id == $company->id &&
            $company->isBuilder() &&
            $company->chas_lotmix &&
            $user->state->getLotmixAccess($company) == LotmixStateSettings::LOTMIX_ACCESS_ENABLED;
    }

    /**
     * Determine whether the user can delete the company.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Company  $company
     * @return mixed
     */
    public function delete(User $user, Company $company)
    {
        //
    }
}
