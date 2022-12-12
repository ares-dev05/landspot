<?php

namespace App\Policies;

use App\Models\EstatePremiumFeatures;
use App\Models\Permission;
use App\Models\User;
use App\Models\Estate;
use App\Models\InvitedUser;
use Illuminate\Auth\Access\HandlesAuthorization;

class EstatePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the estate.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Estate  $estate
     * @return mixed
     */
    public function view(User $user, Estate $estate)
    {
        if ($user->company->isBuilder() && !$estate->published) return false;

        return $estate->approved > 0 && $user->estate->contains($estate);
    }

    //TODO: deprecated
    /**
     * Determine whether the user can view the estate.
     *
     * @param \App\Models\InvitedUser $user
     * @param \App\Models\Estate $estate
     * @return mixed
     * @throws \Exception
     */
    public function viewByInvitedUser(InvitedUser $user, Estate $estate)
    {
        /** @var InvitedUser $user */
        $estates = $user->getEstatesLotCount([
            'published' => 1,
            'lotmix' => 1
        ]);
        return $estates->contains('id', $estate->id);
    }

    /**
     * Determine whether the user can create estates.
     *
     * @param  \App\Models\User  $user
     * @return mixed
     */
    public function create(User $user)
    {
        return false;
    }


    /**
     * Determine whether the user can upload estate packages.
     *
     * @param  \App\Models\User  $user
     * @return mixed
     */
    public function storeEstatePackages(User $user)
    {
        return $user->isLandDeveloper() ||
            $user->isGlobalEstateManager() ||
            $user->isEstateManager();
    }

    /**
     * Determine whether the user can add estate packages to the stage.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Estate  $estate
     * @return mixed
     */
    public function updateEstateDocuments(User $user, Estate $estate)
    {
        return $user->estate->contains($estate) && ($user->isLandDeveloper() ||
                $user->isGlobalEstateManager() || ($estate->checkPermission(Permission::ListManager, $user->id) ||
                    $estate->checkPermission(Permission::PriceEditor, $user->id)));
    }

    /**
     * Determine whether the user can update the estate.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Estate  $estate
     * @return mixed
     */
    public function update(User $user, Estate $estate)
    {
        return $user->estate->contains($estate) && ($user->isLandDeveloper() ||
                $user->isGlobalEstateManager() || ($estate->checkPermission(Permission::ListManager, $user->id) ||
                    $estate->checkPermission(Permission::PriceEditor, $user->id)));
    }

    /**
     * Determine whether the user can update the estate.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Estate  $estate
     * @return mixed
     */
    public function shortlisted(User $user, Estate $estate)
    {
        //TODO: FIX ME add column instead of true
        return $user->estate->contains($estate)
            && $estate->premiumFeatures()->byType(EstatePremiumFeatures::FEATURE_LOTMIX)->exists()
            && ($user->isLandDeveloper() || $user->isGlobalEstateManager() || true);
    }

    /**
     * Determine whether the user can update price of the lots.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Estate $estate
     * @return mixed
     */
    public function updatePrice(User $user, Estate $estate)
    {
        return $user->estate->contains($estate) && ($user->isLandDeveloper() ||
                $user->isGlobalEstateManager() ||
                $estate->checkPermission(Permission::PriceEditor, $user->id));
    }

    /**
     * Determine whether the user can create stage in the estate.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Estate  $estate
     * @return mixed
     */
    public function createStage(User $user, Estate $estate)
    {
        return $user->estate->contains($estate) && ($user->isLandDeveloper() ||
                $user->isGlobalEstateManager() || ($estate->checkPermission(Permission::ListManager, $user->id) ||
                    $estate->checkPermission(Permission::PriceEditor, $user->id)));
    }

    /**
     * Determine whether the user can upload paragraph image.
     *
     * @param  \App\Models\User  $user
     * @return mixed
     */
    public function uploadParagraphImage(User $user)
    {
        return $user->isLandDeveloper() ||
            $user->isGlobalEstateManager() ||
            $user->isEstateManager();
    }

    /**
     * Determine whether the user can delete the estate.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Estate  $estate
     * @return mixed
     */
    public function delete(User $user, Estate $estate)
    {
        //
    }

    public function updateLotPackages(User $user, Estate $estate)
    {
        /** @var Estate $estate */
        if ($user->estate->contains($estate)) {

            if (($user->isBuilderAdmin() || $estate->pdfManagers()->byId($user->id)->exists())) {
                return true;
            }

            if ($user->company->isBuilder() && !$estate->getPdfManagersCount($user->company_id)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param User $user
     * @param Estate $estate
     * @param string $feature
     * @return bool
     */
    public function premiumFeature(User $user, Estate $estate, $feature)
    {
        return $user->company->isDeveloper() &&
            ($estate->approved > 0 && $user->estate->contains($estate)) &&
            $estate->checkPremiumFeature($feature);
    }

    /**
     * @param User $user
     * @param Estate $estate
     * @param string $feature
     * @return bool
     */
    public function lotDrawerDialog(User $user, Estate $estate, $feature)
    {
        return ($estate->approved > 0 && $user->estate->contains($estate)) &&
            $estate->checkPremiumFeature($feature);
    }
}
