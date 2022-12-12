<?php

namespace App\Http\Controllers;

use App\Models\GlobalSiteSettings;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SiteAdminController extends Controller
{
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

        return view('user.spa', ['rootID' => 'admin-site-settings']);
    }

    protected function _getSettings()
    {
        $siteSettings = GlobalSiteSettings::all(['type', 'value'])->keyBy('type');

        return compact('siteSettings');
    }

    /**
     * @param Request $request
     * @return array
     * @throws \Illuminate\Validation\ValidationException
     */
    function store(Request $request)
    {
        $this->validate($request, [
            'job_email_notifications' => ['integer', Rule::in([0, 1])]
        ]);

        $options = $request->only([GlobalSiteSettings::settingsJobEmailNotifications]);

        foreach ($options as $type => $value) {
            GlobalSiteSettings::byType($type)->updateOrCreate([], compact('value'));
        }

        return $this->_getSettings();
    }
}
