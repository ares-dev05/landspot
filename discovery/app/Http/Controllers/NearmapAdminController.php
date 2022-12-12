<?php

namespace App\Http\Controllers\Auth;
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NearmapAdminController extends Controller
{
    const nearmapApiKey = 'nearmap_api_key';

    /**
     * @param Request $request
     * @throws \Exception
     * @return array
     */
    function index(Request $request)
    {
        if ($request->expectsJson()) {
            return $this->_getSettings();
        }

        return view('user.spa', ['rootID' => 'admin-nearmap-settings']);
    }

    protected function _getSettings()
    {
        $user = auth()->user();
        $nearmapSettings = [
            self::nearmapApiKey => $user->company->nearmap_api_key
        ];

        return compact('nearmapSettings');
    }

    /**
     * @param Request $request
     * @return array
     * @throws \Illuminate\Validation\ValidationException
     */
    function store(Request $request)
    {
        $this->validate($request, [
            self::nearmapApiKey => 'nullable|string|max:128',
        ]);

        /** @var User $user */
        $user = auth()->user();
        $company = $user->company;
        $this->authorize('update', $company);

        $company->update($request->only([self::nearmapApiKey]));

        return $this->_getSettings();
    }
}
