<?php

namespace App\Policies\Sitings;

use App\Models\LotmixStateSettings;
use App\Models\Sitings\{Floorplan, User};
use Illuminate\Auth\Access\HandlesAuthorization;

class FloorplanPolicy
{
    use HandlesAuthorization;

    function view(User $user, Floorplan $f)
    {
        return $user->company_id == $f->company_id ||
            $user->has_portal_access >= User::PORTAL_ACCESS_CONTRACTOR;
    }

    function uploadFiles(User $user, Floorplan $f)
    {
        return ($f->status == Floorplan::STATUS_ATTENTION ||
                $f->status == Floorplan::STATUS_IN_PROGRESS) &&
            $user->has_portal_access == User::PORTAL_ACCESS_BUILDER &&
            $user->state->getSitingAccess($user->company) === LotmixStateSettings::SITING_ACCESS_ENABLED;
    }

    function update(User $user, Floorplan $f)
    {
        return in_array($f->status, [
                Floorplan::STATUS_ATTENTION,
                Floorplan::STATUS_IN_PROGRESS,
            ]) && (
                $user->company_id == $f->company_id ||
                $user->has_portal_access == User::PORTAL_ACCESS_CONTRACTOR
            );
    }

    function acknowledgeNotes(User $user, Floorplan $floorplan)
    {
        return $user->has_portal_access == User::PORTAL_ACCESS_BUILDER &&
            $user->state->getSitingAccess($user->company) === LotmixStateSettings::SITING_ACCESS_ENABLED &&
            $user->company_id == $floorplan->company_id;
    }

    function before(User $user, $ability)
    {
        return ($ability === 'acknowledgeNotes' && $user->isGlobalAdmin()) ?: null;
    }
}
