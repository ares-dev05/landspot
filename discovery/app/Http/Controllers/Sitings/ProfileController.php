<?php

namespace App\Http\Controllers\Sitings;

use App\Http\Controllers\Controller;
use App\Models\Sitings\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;

class ProfileController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function index()
    {
        /** @var User $user */
        $user    = auth()->user();
        $company = $user->company()->first();
        if (!$company) {
            throw new ServiceUnavailableHttpException(null, 'Company not found');
        }

        $permissions = [
            'isContractor'        => $user->has_portal_access == User::PORTAL_ACCESS_CONTRACTOR,
            'dualOccupancy'       => $user->has_multihouse,
            'isAdmin'             => $user->can('sitings-global-admin'),
            'canCreateFloorplans' => $user->can('create-floorplans'),
        ];
        $columns = ['display_name', 'email', 'state_id'];
        if (!$user->isGlobalAdmin()) {
            $user->append('myClientsUrl');
            $columns[] = 'myClientsUrl';
        }
        $user->setVisible($columns);
        $company->addHidden(['id']);

        return compact('user', 'company', 'permissions');
    }
}
