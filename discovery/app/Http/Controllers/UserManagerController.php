<?php

namespace App\Http\Controllers;

use App\Events\PasswordChanged;
use App\Http\Controllers\Auth\UserGuardTrait;
use App\Http\Requests\UserRequest;
use App\Mail\UserInvitation;
use App\Models\{
    Builder,
    Company,
    Estate,
    EstateManager,
    EstateManagerPermission,
    GlobalEstateManager,
    LotmixStateSettings,
    State,
    LandDeveloper,
    Permission,
    SalesLocation,
    User,
    UserGroup,
    UserRole
};
use Carbon\Carbon;
use EmailDisabledCheckHelper;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\View\Factory;
use Illuminate\Http\{RedirectResponse, Request, Response};
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;
use Illuminate\Support\Facades\{Mail, Validator};
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Password;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Support\{Arr, Collection, Str};
use Illuminate\Support\Facades\DB;
use Throwable;

class UserManagerController extends Controller
{

    use UserGuardTrait;

    /**
     * @return Application|Factory|View
     * @throws AuthorizationException
     */
    function userManager()
    {
        if (auth()->user()->isGlobalAdmin()) {
            $this->logoutOthers();
        }
        return view('user.spa', ['rootID' => 'user-manager']);
    }

    /**
     * @return RedirectResponse|array
     */
    function index()
    {
        if (!\request()->expectsJson()) {
            return redirect()->route('landspot.user-manager');
        }

        $user = auth()->user();
        $user->isGlobalAdmin = $user->can('global-admin');
        $user->isBuilderAdmin = $user->can('builder-admin');
        $user->isDeveloperAdmin = $user->can('developer-admin');
        $user->setVisible(['is_user_manager', 'is_global_estate_manager', 'isGlobalAdmin', 'isBuilderAdmin', 'isDeveloperAdmin']);

        return compact('user');
    }

    /**
     * @param UserRequest $request
     * @return array
     * @throws AuthorizationException
     * @throws Throwable
     */
    function store(UserRequest $request)
    {
        ignore_user_abort(true);
        $this->authorize('create', User::class);

        /** @var User $manager */
        $manager = auth()->user();
        $columnValues = $request->columnValues;
        $companyId = $request->filters['company_id'];

        if (!isset($columnValues['state_id'])) {
            $columnValues['state_id'] = $manager->state_id;
        } elseif (!$manager->isGlobalAdmin()) {
            $columnValues['state_id'] = $manager->state_id;
            $companyId = $manager->company_id;
        }

        $company = Company::findOrFail($companyId);

        $userRole = Arr::get($columnValues, 'role', false);
        $salesLocationId = false;
        $salesLocation = null;

        if ($company->isBuilder()) {
            $salesLocationId = Arr::get($columnValues, 'sales_location', false);
            if ($salesLocationId) {
                $company->salesLocation()->findOrFail($salesLocationId);
            }
        }

        $password = $columnValues['password'] ?? Str::random(12);
        $requiredAttributes = [
            'display_name' => $columnValues['display_name'],
            'email' => $columnValues['email'],
            'is_user_manager' => Arr::get($columnValues, 'is_user_manager', 0),
            'is_global_estate_manager' => Arr::get($columnValues, 'is_global_estate_manager', 0),
            'is_discovery_manager' => Arr::get($columnValues, 'is_discovery_manager', 0),
            'phone' => Arr::get($columnValues, 'phone'),
            'company_id' => $companyId,
            'state_id' => $columnValues['state_id'],
            'user_name' => $columnValues['display_name'],
            'password' => password_hash($password, PASSWORD_DEFAULT),
            'activation_token' => '',
            'last_activation_request' => 0,
            'lost_password_request' => 0,
            'active' => 1,
            'verified' => 0,
            'title' => '',
            'sign_up_stamp' => 0,
            'last_sign_in_stamp' => 0,
        ];

        if (Arr::get($columnValues, 'has_portal_access', null) !== null &&
            in_array(
                $columnValues['has_portal_access'],
                [
                    User::PORTAL_ACCESS_SITINGS,
                    User::PORTAL_ACCESS_BUILDER,
                    User::PORTAL_ACCESS_CONTRACTOR,
                    User::PORTAL_ACCESS_ADMIN
                ]) &&
            ($company->isBuilder() || $columnValues['has_portal_access'] != User::PORTAL_ACCESS_BUILDER)
        ) {
            $requiredAttributes['has_portal_access'] = $columnValues['has_portal_access'];
        }

        $result = DB::transaction(function () use (
            $request, $requiredAttributes, $manager, $columnValues,
            $password, $userRole, $salesLocationId
        ) {

            $user = new User();
            $user->fill($requiredAttributes);
            $user->save();

            $user->assignGroup(UserGroup::defaultUsers()->firstOrFail());

            if ($manager->isGlobalAdmin()) {
                if (Arr::get($columnValues, 'is_company_admin')) {
                    $isDeveloper = $user->company->isDeveloper();
                    $companyAdminGroup = $isDeveloper
                        ? UserGroup::developerAdmins()->firstOrFail()
                        : UserGroup::builderAdmins()->firstOrFail();

                    if (!$companyAdminGroup) {
                        $message = "The Group " . ($isDeveloper ? 'Developer' : 'Builder') . " Admins does not exist";
                        throw new HttpException(400, $message);
                    }

                    $user->assignGroup($companyAdminGroup);
                }

                if ($user->company->chas_footprints === 1) {
                    if (Arr::get($columnValues, 'disabled_estates_access', null) !== null) {
                        $user->disabled_estates_access = $columnValues['disabled_estates_access'];
                    }
                }
                if (Arr::get($columnValues, 'chas_discovery', null) !== null) {
                    $user->chas_discovery = $columnValues['chas_discovery'];
                }
                $user->isDirty(['chas_discovery', 'disabled_estates_access']) ? $user->save() : null;
            }

            if ($salesLocationId) {
                /** @var Builder $builder */
                $builder = Builder::findOrFail($user->id);
                $builder->salesLocation()->sync([$salesLocationId]);
            }

            if ($userRole) {
                $user->role()->create(['role' => $userRole]);
            }

            $data = [
                'name' => $user->display_name,
                'company' => $user->company->name,
                'password' => $password,
                'email' => $user->email
            ];

            if ($user->company->isBuilder()) {
                $data['brand'] = $user->company->subdomain;
            }

            return compact('data', 'user');
        });

        $user = $result['user'];
        if ($user->unsubscribed()->doesntExist() && EmailDisabledCheckHelper::checkEmail($user->email)) {
            Mail::queue(new UserInvitation($user, $result['data'], $company->isBuilder()));

        }

        return $this->getUsersWithMessage($request->filters, $user->company_id, 'User was added. Invitation email sent.');
    }

    /**
     * @param UserRequest $request
     * @param $id
     * @return array
     * @throws AuthorizationException
     */
    function update(UserRequest $request, $id)
    {
        /** @var User $user */
        $user = User::query()->withoutGlobalScopes()->find($id);
        $this->authorize('update', $user);

        DB::transaction(function () use ($request, $user) {
            $columnValues = $request->columnValues;
            $user->display_name = $columnValues['display_name'];
            $user->email = $columnValues['email'];
            $user->state_id = $columnValues['state_id'];
            $user->phone = $columnValues['phone'];
            $user->is_brief_admin = $columnValues['is_brief_admin'];
            $user->enabled = $columnValues['enabled'];

            $isDeveloper = $user->company->isDeveloper();
            $isBuilder = $user->company->isBuilder();
            if ($isDeveloper) {
                $user->has_lotmix_access = $columnValues['has_lotmix_access'];
            }
            if ($isBuilder && !$user->isBuilderAdmin()) {
                $user->is_user_manager = $columnValues['is_user_manager'];
                $user->is_discovery_manager = $columnValues['is_discovery_manager'];
            } elseif ($isDeveloper && !$user->isLandDeveloper()) {
                $user->is_user_manager = $columnValues['is_user_manager'];
                $user->is_global_estate_manager = $columnValues['is_global_estate_manager'];
            }

            if (Arr::get($columnValues, 'password', false)) {
                $user->password = password_hash($columnValues['password'], PASSWORD_DEFAULT);
            }

            if ($isBuilder && $salesLocation = Arr::get($columnValues, 'sales_location', false)) {
                $builder = Builder::findOrFail($user->id);
                $builder->salesLocation()->sync([$salesLocation]);
            }

            if ($userRole = Arr::get($columnValues, 'role', false)) {
                $user->role()->updateOrCreate([], ['role' => $userRole]);
            } else {
                $user->role()->each(function (UserRole $r) {
                    $r->delete();
                });
            }

            if (auth()->user()->isBuilderAdmin()) {
                if (Arr::get($columnValues, 'has_exclusive', null) !== null) {
                    $user->has_exclusive = $columnValues['has_exclusive'];
                }
                if (Arr::get($columnValues, 'has_nearmap', null) !== null) {
                    $user->has_nearmap = $columnValues['has_nearmap'];
                }
                if (Arr::get($columnValues, 'has_portal_access', null) !== null &&
                    in_array(
                        $columnValues['has_portal_access'],
                        [
                            User::PORTAL_ACCESS_SITINGS,
                            User::PORTAL_ACCESS_BUILDER,
                            User::PORTAL_ACCESS_CONTRACTOR,
                            User::PORTAL_ACCESS_ADMIN
                        ]) &&
                    ($user->company->isBuilder() || $columnValues['has_portal_access'] != User::PORTAL_ACCESS_BUILDER)
                ) {
                    $user->has_portal_access = $columnValues['has_portal_access'];
                }
            }
            if (auth()->user()->isGlobalAdmin()) {
                $companyAdminGroup = $isDeveloper
                    ? UserGroup::developerAdmins()->firstOrFail()
                    : UserGroup::builderAdmins()->firstOrFail();

                if (!$companyAdminGroup) {
                    $message = "The Group " . ($isDeveloper ? 'Developer' : 'Builder') . " Admins does not exist";
                    throw new HttpException(400, $message);
                }

                $defaultGroup = UserGroup::defaultUsers()->firstOrFail();
                $isCompanyAdmin = $columnValues['is_company_admin'];

                if (!$user->isGlobalAdmin()) {
                    $user->group()->sync($isCompanyAdmin ? [$companyAdminGroup->id, $defaultGroup->id] : [$defaultGroup->id]);
                }

                if ($user->company->chas_footprints === 1) {
                    if (Arr::get($columnValues, 'disabled_estates_access', null) !== null) {
                        $user->disabled_estates_access = $columnValues['disabled_estates_access'];
                    }
                }
                if (Arr::get($columnValues, 'exclusive_access', null) !== null) {
                    $user->has_exclusive = $columnValues['exclusive_access'];
                }
                if (Arr::get($columnValues, 'has_all_sitings', null) !== null) {
                    $user->has_all_sitings = $columnValues['has_all_sitings'];
                }
                if (Arr::get($columnValues, 'chas_discovery', null) !== null) {
                    $user->chas_discovery = $columnValues['chas_discovery'];
                }
                if (Arr::get($columnValues, 'draft_feature', null) !== null) {
                    $user->draft_feature = $columnValues['draft_feature'];
                }
                if (Arr::get($columnValues, 'has_portal_access', null) !== null &&
                    in_array(
                        $columnValues['has_portal_access'],
                        [
                            User::PORTAL_ACCESS_SITINGS,
                            User::PORTAL_ACCESS_BUILDER,
                            User::PORTAL_ACCESS_CONTRACTOR,
                            User::PORTAL_ACCESS_ADMIN
                        ]) &&
                    ($user->company->isBuilder() || $columnValues['has_portal_access'] != User::PORTAL_ACCESS_BUILDER)
                ) {
                    $user->has_portal_access = $columnValues['has_portal_access'];
                }

                $emailNotifications = Arr::get($columnValues, 'disabled_email_notifications');
                if ($emailNotifications) {
                    $user->disabledEmailNotification()->firstOrCreate([]);
                } else {
                    $user->disabledEmailNotification()->delete();
                }
            }

            $user->save();

            if (isset($columnValues['password'])) {
                event(new PasswordChanged($user));
            }
        });

        return $this->getUsersWithMessage($request->filters, $user->company_id, 'User details were updated');
    }

    /**
     * @param Request $request
     * @param $id
     * @return array
     * @throws AuthorizationException
     */
    function destroy(Request $request, $id)
    {
        /** @var User $user */
        $user = User::query()->withoutGlobalScopes()->findOrFail($id);
        $this->authorize('delete', $user);

        $user->hidden = true;
        $user->enabled = false;
        $user->save();

        return $this->getUsersWithMessage($request->filters, $user->company_id, 'User was deleted');
    }

    /**
     * @param Request $request
     * @param $id
     * @return array
     * @throws AuthorizationException
     */
    function restore(Request $request, $id)
    {
        /** @var User $user */
        $user = User::query()->withoutGlobalScopes()->findOrFail($id);
        $this->authorize('restore');

        $user->hidden = false;
        $user->enabled = true;
        $user->save();

        return $this->getUsersWithMessage($request->filters, $user->company_id, 'User was restored');
    }


    /**
     * @param array $filters
     * @param $companyId
     * @param $resultMessage
     * @return array
     */
    protected function getUsersWithMessage(array $filters, $companyId, $resultMessage)
    {
        $validFilters = $this->getValidFilters($filters);
        $users = $this->getUsersResponse($validFilters, $companyId);
        $message['success'] = $resultMessage;
        $USERS_UPDATED = true;

        return compact('users', 'message', 'USERS_UPDATED');
    }

    /**
     * @param Request $request
     * @param Company $company
     * @return array|Application|Factory|RedirectResponse|View
     * @throws AuthorizationException
     */
    function filterUsers(Request $request, Company $company)
    {
        if (!\request()->expectsJson()) {
            return $company->id === null
                ? redirect()->route('landspot.user-manager')
                : $this->userManager();
        }

        $user = auth()->user();
        $isGlobalAdmin = $user->isGlobalAdmin();
        if ($isGlobalAdmin) {
            $this->logoutOthers();
        }

        $userFilters = $this->getValidFilters($request->all());

        if ($request->filterUsers) {

            $states = $isGlobalAdmin
                ? $this->getCompanyStates($company)
                : State::getStatesByCompanyId($user->company_id)->toArray();

            $company = $this->getCompanyOptions($company);
            $users = $this->getUsersResponse($userFilters, $company->id);
            $userRoles = array_flip(UserRole::USER_ROLES);
            $userDiscoveryLevels = array_flip(User::USER_DISCOVERY_LEVELS);

            $USERS_UPDATED = true;
            return compact('users', 'company', 'states', 'userRoles', 'USERS_UPDATED', 'userDiscoveryLevels');
        }

        return $this->getCompaniesResponse($userFilters);
    }

    protected function getCompanyOptions(Company $company)
    {
        $user = auth()->user();
        if ($company->isBuilder()) {
            $company->load('salesLocation');

            if ($user->isGlobalAdmin()) {
                $company->append(['hasFootprints', 'sitingsSaveSetting']);
            }
        }
        $company->append(['isLandconnect', 'hasInvitedUsers']);
        if (!$user->can('footprints')) {
            $company->addHidden(['chas_estates_access']);
        }
        return $company;
    }

    /**
     * @param array $filters
     * @return array
     */
    protected function getValidFilters(array $filters)
    {
        $validFilters = array_flip(['name', /*'email', */ 'userManager', 'globalEstateManager']);
        $userFilters = array_intersect_key($filters, $validFilters);

        $user = auth()->user();
        if ($user->isGlobalAdmin() ||
            $user->isLandDeveloper()) {
            return $userFilters;
        }

        if (!$user->isBuilderAdmin()) {
            $userFilters['withoutAdmins'] = 1;
        }

        $userFilters['state_id'] = $user->state_id;

        return $userFilters;
    }

    /**
     * @param array $userFilters
     * @param $companyId
     * @return Collection
     */
    protected function getUsersResponse(array $userFilters, $companyId)
    {
        $users = User::getFilteredCollection([$companyId], $userFilters);
        $isGlobalAdmin = auth()->user()->isGlobalAdmin();

        if (!$isGlobalAdmin) {
            $users = $users->filter(function ($item) {
                return User::notHiddenById($item->id)->exists();
            })->values();
        }

        $users->map(function ($item) use ($isGlobalAdmin) {
            /** @var User $user */
            $user = User::query()->withoutGlobalScopes()->findOrFail($item->id);

            if ($user->company->isDeveloper()) {
                $item->is_company_admin = $user->isLandDeveloper() ? 1 : 0;
            } elseif ($user->company->isBuilder()) {
                /** @var Builder $user */
                $user = Builder::query()->withoutGlobalScopes()->findOrFail($item->id);

                if ($user->can('footprints')) {
                    $item->disabled_estates_access = $user->disabled_estates_access;
                }
                $item->chas_discovery = $user->chas_discovery;
                $item->sales_location = optional($user->salesLocation()->first())->id;
                $item->is_company_admin = $user->isBuilderAdmin() ? 1 : 0;
            }
            $item->is_global_admin = $user->isGlobalAdmin();
            $item->role = optional($user->role)->role;
            $item->disabled_email_notifications = (int)$item->disabled_email_notifications;
            $item->draft_feature = $user->draft_feature;
            $item->is_brief_admin = $user->is_brief_admin;
            $item->enabled = $user->enabled;
            $item->inactive = $user->inactive;

            if ($isGlobalAdmin) {
                $item->hidden = $user->hidden;
                $item->is_support_requested = auth()->user()->supportRequests->contains($user);
                $item->has_2fa = $user->twofa_secret != '';
                $item->has_all_sitings = $user->has_all_sitings;
            }
        });

        return $users;
    }

    /**
     * @param array $userFilters
     * @return array
     */
    protected function getCompaniesResponse(array $userFilters)
    {
        $user = auth()->user();
        $companies = $user->getUserCompanies();
        $companiesIds = array_keys($companies);

        foreach ($companies as &$company) {
            $company['users_count'] = 0;
        }

        $data = User::countAvailableUsers($companiesIds, $userFilters);

        foreach ($data as $item) {
            $companies[$item->company_id]['users_count'] = $item->users_count;
        }

        $companies = collect($companies)->values();
        $COMPANIES_UPDATED = true;

        return compact('companies', 'COMPANIES_UPDATED');
    }

    /**
     * @param Request $request
     * @param User $user
     * @return array
     * @throws Exception
     * @throws AuthorizationException
     */
    function getEstatesManagerPermissions(Request $request, User $user)
    {
        $this->authorize('view', $user);

        $user = $this->checkUser($user);

        $estates = $this->getManagerEstates($user);

        $permissions = Permission::get(['id', 'name', 'label']);

        return compact('estates', 'permissions');
    }

    /**
     * @param User $user
     * @return Collection
     * @throws Exception
     */
    protected function getManagerEstates(User $user)
    {
        $estates = Estate::getManagerEstates($user->id)
            ->where(['e.company_id' => $user->company_id])
            ->get();

        $estates->map(function ($item) use ($user) {
            if ($item->permissions) {
                $permissions = explode(',', $item->permissions);

                $permissionsList = [];

                foreach ($permissions as $permission) {
                    list($key, $value) = explode(':', $permission);

                    $permissionsList[$key] = $value;
                }
                $item->permissions = collect($permissionsList);
            } else {
                $item->permissions = [];
            }
            //$item->thumb = Estate::getValidPath($item->thumb ?? $item->path);
            //$item->small = Estate::getValidPath($item->small ?? $item->path);
            unset($item->path);
        });

        return $estates;
    }

    /**
     * @param User $user
     * @return User
     * @throws Exception
     */
    protected function checkUser(User $user)
    {
        if ($user->company->isBuilder()) {
            $user = Builder::find($user->id);
        } elseif ($user->company->isDeveloper()) {
            if ($user->hasGroup(UserGroup::GroupDeveloperAdmins)) {
                $user = LandDeveloper::find($user->id);
            } elseif ($user->hasGroup(UserGroup::GroupDefault) && $user->isGlobalEstateManager()) {
                $user = GlobalEstateManager::find($user->id);
            } elseif ($user->hasGroup(UserGroup::GroupDefault)) {
                $user = EstateManager::find($user->id);
            } else {
                throw new HttpException(400, 'Invalid user group');
            }
        } else {
            throw  new HttpException(400, 'Invalid user company');
        }

        return $user;
    }

    /**
     * @param Request $request
     * @param User $user
     * @return array
     * @throws Exception
     * @throws AuthorizationException
     */
    function saveEstateManagerPermissions(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $permissions = $request->permissions;
        $user = $this->checkUser($user);

        if ($user instanceof EstateManager) {
            foreach ($permissions as $estateId => $newPermissions) {
                EstateManagerPermission::where('manager_id', $user->id)
                    ->where('estate_id', $estateId)->delete();

                $user->estate()->detach($estateId);

                if (!empty($newPermissions)) {
                    ksort($newPermissions);
                    foreach ($newPermissions as $key => $value) {
                        $permission = Permission::findOrFail($key);
                        EstateManagerPermission::create([
                            'manager_id' => $user->id,
                            'permission_id' => $key,
                            'estate_id' => $estateId
                        ]);
                        if ($permission->name == 'read_only') break;
                    }
                    $user->estate()->attach($estateId);
                }
            }
        }
        $message['success'] = "Permissions saved";

        return compact('message', 'user');
    }

    /**
     * @param Request $request
     * @param User $user
     * @return RedirectResponse|Response
     * @throws Exception
     * @throws AuthorizationException
     */
    function loginAs(Request $request, User $user)
    {
        $this->authorize('viewAsGlobalAdmin', User::class);

        if ($user->is_grant_support_access) {
            $userGuard = $this->getUserGuard($request, $user);

            $this->logoutOthers();

            auth()->guard($userGuard)->loginUsingId($user->id);

            return redirect(auth()->guard($userGuard)->user()->getBaseRoute());
        } else {
            return back()->withErrors(['Unauthorized action.']);
        }
    }

    /**
     * @return $this
     * @throws AuthorizationException
     */
    protected function logoutOthers()
    {
        $this->authorize('viewAsGlobalAdmin', User::class);

        $authGuards = array_keys(config('auth.guards'));

        foreach ($authGuards as $guard) {
            if ($guard !== 'globalAdmin' && auth()->guard($guard)->check()) auth()->guard($guard)->logout();
        }

        return $this;
    }

    /**
     * @param Request $request
     * @param User $user
     * @return array
     */
    function sendResetPasswordLink(Request $request, User $user)
    {
        \Password::broker()->sendResetLink(
            ['email' => $user->email]
        );
        $message['success'] = "Link sent";

        return compact('message');
    }

    /**
     * @param Request $request
     * @param User $user
     * @return array
     */
    function resetUser2FA(Request $request, User $user)
    {
        $user->update([
            'twofa_secret' => null,
            'device_fp' => null
        ]);

        return $this->getUsersWithMessage(
            $request->filters,
            $user->company_id,
            'Two factor authorization has been disabled'
        );
    }


    /**
     * @param Request $request
     * @param User $user
     * @return array
     * @throws AuthorizationException
     */
    function supportRequest(Request $request, User $user)
    {
        $this->authorize('viewAsGlobalAdmin', $user);

        auth()->user()->supportRequests()->attach($user);

        $companyId = $user->company_id;

        return $this->getUsersWithMessage($request->filters, $companyId, 'Request for support sent');
    }


    /**
     * @param Request $request
     * @param User $user
     * @return array
     * @throws AuthorizationException
     */
    function closeAccess(Request $request, User $user)
    {
        $this->authorize('viewAsGlobalAdmin', $user);

        $user->update(['is_grant_support_access' => 0]);
        auth()->user()->closedSupportSessions()->attach($user);

        $companyId = $user->company_id;

        return $this->getUsersWithMessage($request->filters, $companyId, 'Access to user is closed');
    }

    /**
     * @param Company $company
     * @return array
     * @throws Exception
     */
    function updateSalesLocations(Company $company)
    {
        if (!$company->isBuilder()) {
            throw new HttpException(400, 'Invalid company type');
        }

        Validator::extend('validate_locations', function ($attribute, $value, $parameters, $validator) {
            if (is_array($value)) {
                foreach ($value as $location) {
                    if (mb_strlen(Arr::get($location, 'name')) > 160) {
                        return false;
                    }
                    if (!Arr::get($location, 'isNew', false)) {
                        Rule::exists('sales_locations', 'id');
                    }
                }
            }

            return true;
        });

        $this->validate(
            \request(),
            [
                'deletedLocations' => 'present|array',
                'deletedLocations.id' => 'exists:sales_locations,id',
                'locations' => 'present|array|validate_locations',
            ]
        );

        $deletedLocations = \request()->deletedLocations;
        $locations = \request()->locations;

        foreach ($deletedLocations as $location) {
            SalesLocation::findOrFail($location['id'])->delete();
        }

        foreach ($locations as $location) {
            if ($location['name'] === '') {
                SalesLocation::findOrFail($location['id'])->delete();
            }

            Arr::get($location, 'isNew', false)
                ? $company->salesLocation()->create(['name' => $location['name']])
                : SalesLocation::findOrFail($location['id'])->update(['name' => $location['name']]);
        }

        $message['success'] = 'Sales locations were updated';
        return compact('message');
    }

    /**
     * @param Company $company
     * @return array
     * @throws AuthorizationException
     * @throws ValidationException
     */
    function updateLotmixStateSettings(Company $company)
    {
        $this->authorize("globalAdmin");

        $data = $this->validate(
            \request(),
            [
                'chasLotmix' => [
                    'required',
                    'numeric',
                    Rule::in([
                        Company::LOTMIX_ACCESS_DISABLED,
                        Company::LOTMIX_ACCESS_ENABLED,
                    ])
                ],
                'lotmixStateSettings' => 'required|array',
                'lotmixStateSettings.*.state_id' => 'exists:house_states,id',
                'lotmixStateSettings.*.value' => [
                    'required',
                    'numeric',
                    Rule::in(
                        array_keys(LotmixStateSettings::SITING_SAVE_SETTINGS)
                    )
                ],
                'lotmixStateSettings.*.has_lotmix' => [
                    'required',
                    'numeric',
                    Rule::in([
                        LotmixStateSettings::LOTMIX_ACCESS_ENABLED,
                        LotmixStateSettings::LOTMIX_ACCESS_DISABLED
                    ])
                ],
                'lotmixStateSettings.*.has_siting_access' => [
                    'required',
                    'numeric',
                    Rule::in([
                        LotmixStateSettings::SITING_ACCESS_ENABLED,
                        LotmixStateSettings::SITING_ACCESS_DISABLED
                    ])
                ],
                'lotmixStateSettings.*.has_estates_disabled' => [
                    'required',
                    'numeric',
                    Rule::in([
                        LotmixStateSettings::ESTATES_ACCESS_ENABLED,
                        LotmixStateSettings::ESTATES_ACCESS_DISABLED
                    ])
                ],
            ]
        );

        $company->update(['chas_lotmix' => $data['chasLotmix']]);

        foreach ($data['lotmixStateSettings'] as $state) {
            unset($state['name']);
            $company->lotmixStateSettings()->updateOrCreate(['state_id' => $state['state_id']], $state);
        }

        $message['success'] = "Permissions saved";
        $states = $this->getCompanyStates($company);
        $company = $this->getCompanyOptions($company);

        return compact('states', 'message', 'company');
    }

    /**
     * @param Company $company
     * @return mixed
     */
    protected function getCompanyStates(Company $company)
    {
        return State::get()->each(function (State $s) use ($company) {
            $s->lotmixSettingsValue = $s->getLotmixSettingsValue($company);
            $s->lotmixAccess = $s->getLotmixAccess($company);
            $s->sitingAccess = $s->getSitingAccess($company);
            $s->estatesDisabled = $s->getEstatesDisabled($company);
        });
    }
}
