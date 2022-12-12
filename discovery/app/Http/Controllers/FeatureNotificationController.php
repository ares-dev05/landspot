<?php

namespace App\Http\Controllers;

use App\Models\{
    Company, FeatureNotification, HouseState, User
};
use Illuminate\Http\Request;

class FeatureNotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        if (\request()->expectsJson()) {
            $featureNotifications = FeatureNotification::with(['companies:companies.id,companies.name'])->paginate(50);
            $companies = $this->getCompaniesCollection();

            return compact('featureNotifications', 'companies');
        }

        return $this->_view();
    }

    public function show()
    {
        if (\request()->expectsJson()) {
            $featureNotification = FeatureNotification::find(\request()->featureNotification);

            if ($featureNotification) {
                $companies = $this->getCompaniesCollection();
                $states = HouseState::all();
                $featureNotification->load(['companies', 'states']);

                return compact('featureNotification', 'companies', 'notificationCompanies', 'notificationStates', 'states');
            }

            return redirect('/landspot/notifications/features');
        }

        return $this->_view();
    }

    public function getCompanies()
    {
        if (\request()->expectsJson()) {
            $companies = $this->getCompaniesCollection();
            $states = HouseState::all();
            return compact('companies', 'states');
        }

        return $this->_view();
    }

    protected function getCompaniesCollection()
    {
        return $companies = Company::get(['id', 'name']);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return $this->_view();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     * @throws \Exception
     */
    public function store(Request $request)
    {
        $postData = $this->validateRequest();
        $featureNotification = FeatureNotification::create($postData);
        $message = 'Notification created';

        return $this->prepareNotification($featureNotification, $message);
    }

    /**
     * @param FeatureNotification $featureNotification
     * @param string $message
     * @return array
     */
    protected function prepareNotification(FeatureNotification $featureNotification, $message)
    {
        if ($companyIds = object_get(\request(), 'companyIds', [])) {
            $changes = $featureNotification->companies()->sync($companyIds);
            if (!empty($changes['attached']) || !empty($changes['detached']) || !empty($changes['updated'])) {
                $featureNotification->touch();
            }
        }
        if ($stateIds = object_get(\request(), 'stateIds', [])) {
            $changes = $featureNotification->states()->sync($stateIds);
            if (!empty($changes['attached']) || !empty($changes['detached']) || !empty($changes['updated'])) {
                $featureNotification->touch();
            }
        }

        if (object_get(\request(), 'is_sent', null)) {
            $userIds = [];

            $featureNotification->companies->each(function (Company $company) use (&$userIds, $stateIds) {
                $company->user()->each(function (User $user) use (&$userIds, $stateIds) {
                    if (in_array($user->state_id, $stateIds)) {
                        $userIds = array_merge($userIds, [$user->id]);
                    }
                });
            });

            foreach ($featureNotification->userNotification as $userNotification) {
                if (!in_array($userNotification->user_id, $userIds) && !$userNotification->trashed()) {
                    $userNotification->delete();
                }
            }

            foreach ($userIds as $userId) {
                $featureNotification->userNotification()->updateOrCreate([
                    'user_id' => $userId
                ], [
                    'deleted_at' => null
                ]);
            }

            $featureNotification->update([
                'sent_timestamp' => time()
            ]);

            $message .= ' and successfully sent';
        }

        return compact('message', 'featureNotification');
    }

    function send(FeatureNotification $featureNotification)
    {
        request()->merge([
            'is_sent' => 1
        ]);

        return $this->prepareNotification($featureNotification, 'Notification updated');
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param FeatureNotification $featureNotification
     * @return \Illuminate\Http\Response
     */
    public function edit(FeatureNotification $featureNotification)
    {
        if (\request()->expectsJson()) {
            return compact('featureNotification');
        }

        return $this->_view();
    }

    /**
     * Update the specified resource in storage.
     *
     * @param FeatureNotification $featureNotification
     * @return \Illuminate\Http\Response
     * @throws \Exception
     */
    public function update(FeatureNotification $featureNotification)
    {
        $postData = $this->validateRequest();
        $featureNotification->update($postData);
        $message = 'Notification edited';

        return $this->prepareNotification($featureNotification, $message);
    }

    /**
     * @return array
     * @throws \Exception
     */
    protected function validateRequest()
    {
        return $this->validate(
            \request(),
            [
                'title'        => 'required',
                'content'      => 'required',
                'is_sent'      => 'required|boolean',
                'companyIds'   => 'nullable|array|required_if:is_sent,1',
                'companyIds.*' => 'numeric|exists:companies,id',
                'stateIds'     => 'nullable|array|required_if:is_sent,1',
                'stateIds.*'   => 'numeric|exists:house_states,id'
            ],
            [
                'companyIds.required_if' => 'You must select at least one company to which the notification will be sent.',
                'stateIds.required_if'   => 'You must select at least one state to which the notification will be sent.',
            ]
        );
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param FeatureNotification $featureNotification
     * @return \Illuminate\Http\Response
     * @throws \Exception
     */
    public function destroy(FeatureNotification $featureNotification)
    {
        $featureNotification->delete();
        $featureNotifications = FeatureNotification::with(['companies:companies.id,companies.name'])->paginate(50);
        $message = 'Notification removed';

        return compact('featureNotifications', 'message');
    }

    protected function _view()
    {
        return view('user.spa', ['rootID' => 'notifications']);
    }
}
