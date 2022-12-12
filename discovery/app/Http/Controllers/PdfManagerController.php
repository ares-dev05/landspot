<?php

namespace App\Http\Controllers;

use App\Events\BrowserNotification;
use App\Http\Requests\PdfManagerPermissionRequest;
use App\Models\{Builder, Company, Estate, User};
use Illuminate\Http\Request;

class PdfManagerController extends Controller
{

    /**
     * @return \Illuminate\View\View
     */
    function pdfManager()
    {
        return view('user.spa', ['rootID' => 'pdf-manager']);
    }

    /**
     * @return \Illuminate\Http\Response
     */
    function index()
    {
        if (!\request()->expectsJson()) {
            return redirect()->route('landspot.pdf-manager');
        }
        $user = auth()->user();

        $user->isGlobalAdmin = $user->can('global-admin');
        $user->setVisible(['id', 'isGlobalAdmin']);

        return response(['user' => $user]);
    }

    /**
     * @param Request $request
     * @param Company $company
     * @return array|\Illuminate\Http\Response|\Illuminate\View\View
     */
    function filterUsers(Request $request, Company $company)
    {
        if (!\request()->expectsJson()) {
            return $company->id === null
                ? redirect()->route('landspot.pdf-manager')
                : $this->pdfManager();
        }

        $userFilters = $this->getValidFilters($request->all());

        if ($request->filterUsers) {
            return $this->getUsersResponce($company->id, $userFilters);
        }

        return $this->getCompaniesResponse($userFilters);
    }

    /**
     * @param int $companyId
     * @param array $filters
     * @return array
     */
    protected function getUsersResponce($companyId, array $filters)
    {
        $users   = User::getFilteredCollection([$companyId], $filters, 'display_name');

        $estates = Estate::getEstatesWithPdfManagers($companyId, $filters);
        return compact('users', 'estates');
    }

    /**
     * @param array $filters
     * @return array
     */
    protected function getValidFilters(array $filters)
    {
        $validFilters = array_flip(['name', 'estateName', 'emptyEstates']);
        $userFilters  = array_intersect_key($filters, $validFilters);
        $userFilters['withoutAdmins']  = 1;

        $user = auth()->user();

        if ($user->isBuilderAdmin() && !$user->isGlobalAdmin()) {
            $userFilters['published'] = 1;
            $userFilters['approved']  = 1;
            $userFilters['state_id']  = $user->state_id;
        }

        return $userFilters;
    }

    /**
     * @param array $userFilters
     * @return \Illuminate\Http\Response
     */
    protected function getCompaniesResponse(array $userFilters)
    {
        /** @var Builder $user */
        $user         = auth()->user();
        $companies    = $user->getUserCompanies(true);
        $companiesIds = array_keys($companies);

        foreach ($companies as &$company) {
            $company['users_count'] = 0;
        }

        $data = User::countAvailableUsers($companiesIds, $userFilters);

        foreach ($data as $item) {
            $companies[$item->company_id]['users_count'] = $item->users_count;
        }

        $companies = collect($companies)->values();

        return compact('companies');
    }

    /**
     * @param User $user
     * @return PdfManagerController
     * @throws \Exception
     */
    protected function checkUser(User $user)
    {
        if (!$user->company->isBuilder()) {
            throw new \Exception('Invalid user group');
        }

        return $this;
    }

    /**
     * @param PdfManagerPermissionRequest $request
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Exception
     */
    function store(PdfManagerPermissionRequest $request)
    {
        $selectedManagers = $request->selectedManagers;
        $deletedManagers  = $request->deletedManagers;
        $estateId         = $request->estateId;
        $companyId        = $request->companyId;
        /** @var Estate $estate */
        $estate = Estate::findOrFail($estateId);
        $this->authorize('view', $estate);

        foreach ($deletedManagers as $manager) {
            $user = Builder::findOrFail($manager['id']);
            $this->authorize('update', $user);
            $this->checkUser($user);
            $estate->pdfManagers()->detach($user);
        }

        foreach ($selectedManagers as $manager) {
            /** @var Builder $user */
            $user   = Builder::findOrFail($manager['id']);
            $this->authorize('update', $user);
            $this->checkUser($user);

            if ($user->state_id != $estate->state_id) {
                continue;
            }

            if ($estate->pdfManagers()
                       ->byId($user->id)
                       ->doesntExist()) {

                $estate->pdfManagers()->attach($user);

                try {
                    $notification = [
                        'title'      => 'Your permissions have been updated',
                        'icon'       => $estate->thumbImage,
                        'onClickUrl' => $estate->publicUrl,
                        'text'       => "You have just been granted access to upload PDF documents to an estate {$estate->name}."
                    ];

                    broadcast(new BrowserNotification($user->getBrowserNotificationChannel(), $notification));
                } catch (\Exception $e) {
                    logger()->info("Broadcast BrowserNotification event");
                    logger()->error($e->getMessage());
                }
            }
        }

        $message['success'] = "Permission saved";

        return compact('message', 'companyId');
    }

    /**
     * @param PdfManagerPermissionRequest $request
     * @param Builder $user
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Exception
     */
    function update(PdfManagerPermissionRequest $request, Builder $user)
    {
        $this->authorize('update', $user);
        $this->checkUser($user);
        $estate = Estate::findOrFail($request->estateId);
        $this->authorize('view', $estate);

        $estate->pdfManagers()->detach($user);

        $userFilters = $this->getValidFilters($request->filters);

        return $this->getUsersResponce($user->company_id, $userFilters);
    }
}
