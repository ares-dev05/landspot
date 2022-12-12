<?php

namespace App\Policies;

use App\Models\{
    LotPackage, User, Company
};
use Illuminate\Auth\Access\HandlesAuthorization;

class LotPackagePolicy
{
    use HandlesAuthorization;

    /**
     *
     * @param  User $user
     * @param  LotPackage $package
     * @return bool
     */
    public function view(User $user, LotPackage $package)
    {
        /** @var Company $company */
        $company = $user->company()->first();
        $package = clone $package;
        if ($company->isBuilder()) {
            return $package->company_id == $user->company_id && $package->lot->stage->published;
        }

        if ($company->isDeveloper()) {
            return !!$user->estate()->find($package->lot->stage->estate_id);
        }

        return false;
    }

    public function create(User $user, LotPackage $package)
    {
        return $this->view($user, $package);
    }

}
