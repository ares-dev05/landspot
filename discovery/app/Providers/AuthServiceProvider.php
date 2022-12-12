<?php

namespace App\Providers;

use App\Models\{
    Builder,
    BuilderAdmin,
    Company,
    Estate,
    EstateManager,
    EstatePremiumFeatures,
    File,
    House,
    InvitedUser,
    LandDeveloper,
    Lot,
    LotmixStateSettings,
    LotPackage,
    Range,
    Sitings\Floorplan,
    Sitings\FloorplanFiles,
    Sitings\Siting,
    Stage,
    User,
    ChatChannel,
    InvitedUserDocument};
use App\Packages\Passport\LandspotPassport;
use App\Policies\{
    CompanyPolicy,
    EstatePolicy,
    HousePolicy,
    InvitedUserPolicy,
    LotPackagePolicy,
    ChatChannelPolicy,
    InvitedUserDocumentPolicy,
    LotPolicy,
    RangePolicy,
    Sitings\FloorplanFilesPolicy,
    Sitings\FloorplanPolicy,
    Sitings\SitingPolicy,
    StagePolicy,
    UserPolicy,
    PdfManagerPolicy
};
use Illuminate\Support\Facades\{App, Auth, Gate};
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;
use Landconnect\Blog\Blog;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        User::class => UserPolicy::class,
        Builder::class => PdfManagerPolicy::class,
        Stage::class => StagePolicy::class,
        Lot::class => LotPolicy::class,
        Company::class => CompanyPolicy::class,
        Estate::class => EstatePolicy::class,
        House::class => HousePolicy::class,
        Range::class => RangePolicy::class,
        ChatChannel::class => ChatChannelPolicy::class,
        LotPackage::class => LotPackagePolicy::class,
        InvitedUser::class => InvitedUserPolicy::class,
        InvitedUserDocument::class => InvitedUserDocumentPolicy::class,

        Floorplan::class => FloorplanPolicy::class,
        FloorplanFiles::class => FloorplanFilesPolicy::class,
        Siting::class => SitingPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        if (App::runningInConsole()) {
            return;
        }

        Gate::before(function ($user, $ability) {
            /**
             * @var User|LandDeveloper|EstateManager|Builder $user
             * @var string $ability
             */
            switch ($ability) {
                case 'developer-admin':
                case 'sitings-global-admin':
                case 'createEstate':
                case 'chat':
                case 'create-floorplans':
                case 'manage-my-clients':
                    return null;
                default:
                    return $user->isGlobalAdmin() ?: null;
            }
        });

        Gate::define('manage-users', function ($user) {

            /** @var User|LandDeveloper|EstateManager|Builder $user */
            return
				($user->isUserManager() && $user->company->isDeveloper())
                || $user->isLandDeveloper()
                || ($user->isBuilderAdmin()
                    || ($user->isUserManager() && $user->company->isBuilder() && $user->company->chas_footprints == 0))
                || Auth::guard('globalAdmin')->check();
        });

        Gate::define('state-access', function ($user) {
            /** @var User $user */
            return $user->state->getSitingAccess($user->company) === LotmixStateSettings::SITING_ACCESS_ENABLED;
        });

        Gate::define('global-admin', function ($user) {
            /** @var User|LandDeveloper|EstateManager|Builder $user */
            return $user->isGlobalAdmin();
        });

        Gate::define('builder-admin', function ($user) {
            /** @var User|BuilderAdmin|Builder $user */
            return $user->isBuilderAdmin() || $user->isGlobalAdmin();
        });

        Gate::define('developer-admin', function ($user) {
            /** @var User|BuilderAdmin|Builder $user */
            return $user->isLandDeveloper() || $user->isGlobalAdmin();
        });

        Gate::define('pdf-managers', function ($user) {
            /** @var User|LandDeveloper|EstateManager|Builder $user */
            return ($user->company->isBuilder() && !$user->isGlobalAdmin()) &&
                $user->isBuilderAdmin() &&
                ($user->chas_discovery == User::USER_DISCOVERY_LEVELS['Permanent access'] ||
                    ($user->company->chas_discovery == 1 && $user->chas_discovery != User::USER_DISCOVERY_LEVELS['Access disabled']));
        });

        Gate::define('manage-companies', function ($user) {
            /** @var User|LandDeveloper|EstateManager|Builder $user */
            return $user->isGlobalAdmin();
        });

        Gate::define('discovery-manager', function ($user) {

            /** @var User|LandDeveloper|EstateManager|Builder $user */
            return ($user->isBuilderAdmin() || $user->isDiscoveryManager()) &&
                ($user->company->isBuilder() &&
                    ($user->chas_discovery == User::USER_DISCOVERY_LEVELS['Permanent access'] ||
                        ($user->company->chas_discovery == 1 && $user->chas_discovery != User::USER_DISCOVERY_LEVELS['Access disabled'])));
        });

        Gate::define('discovery', function ($user) {

            /** @var User|LandDeveloper|EstateManager|Builder $user */
            return $user->company->isBuilder() &&
                ($user->chas_discovery == User::USER_DISCOVERY_LEVELS['Permanent access'] ||
                    ($user->company->chas_discovery == 1 && $user->chas_discovery != User::USER_DISCOVERY_LEVELS['Access disabled'])
                );
        });

        Gate::define('developer-admin', function (User $user) {
            return !$user->isGlobalAdmin() && ($user->isGlobalEstateManager() || $user->isLandDeveloper());
        });

        Gate::define('footprints', function ($user) {
            /** @var User|LandDeveloper|EstateManager|Builder $user */
            return $user->company->isBuilder() && $user->company->chas_footprints == 1;
        });

        // If estates access is enabled for the current user company
        Gate::define('estates-access-company', function ($user) {
            /** @var User|LandDeveloper|EstateManager|Builder $user */
            return ($user->company->isDeveloper() || !$user->can('footprints'))
                ? true
                : $user->can('footprints') &&
                $user->company->chas_estates_access == 1 &&
                $user->disabled_estates_access == 0;
        });

        // If estates access is enabled for the current user state
        Gate::define('estates-access', function ($user) {
            /** @var User|LandDeveloper|EstateManager|Builder $user */
            return ($user->company->isDeveloper() || !$user->can('footprints'))
                ? true
                : $user->can('footprints') &&
                    $user->company->chas_estates_access == 1 &&
                    $user->disabled_estates_access == 0 &&
                    $user->state->getEstatesDisabled($user->company) == LotmixStateSettings::ESTATES_ACCESS_ENABLED;
        });

        Gate::define('nearmap-admin', function ($user) {
            return $user->is_nearmap_admin && $user->company->chas_nearmap;
        });

        Gate::define('approve-estate', function ($user) {
            /** @var User|LandDeveloper|EstateManager|Builder $user */
            return $user->isGlobalAdmin();
        });

        Gate::define('hasLotmixAccess', function ($user) {
            /** @var User|LandDeveloper|EstateManager|Builder $user */
            $company = $user->company;
            return $company->isDeveloper()
                ? ($user->can('developer-admin') || $user->has_lotmix_access)
                : (
                    $company->isBuilder() &&
                    $company->chas_lotmix &&
                    $user->state->getLotmixAccess($company) == LotmixStateSettings::LOTMIX_ACCESS_ENABLED
                );
        });

        Gate::define('reset-user-password', function (User $user) {
            /** @var User|LandDeveloper|EstateManager|Builder $user */
            return $user->isGlobalAdmin() || $user->isBuilderAdmin();
        });

        Gate::define('reset-user-2fa', function (User $user) {
            /** @var User|LandDeveloper|EstateManager|Builder $user */
            return $user->isGlobalAdmin() || $user->isBuilderAdmin();
        });

        Gate::define('manage-notifications', function (User $user) {
            /** @var User|LandDeveloper|EstateManager|Builder $user */
            return $user->isGlobalAdmin();
        });

        Gate::define('manage-my-clients', function (User $user) {
            /** @var LandDeveloper|EstateManager|Builder $user */
            return $user->isGlobalAdmin() ||
                ($user->can('estates-access-company') &&
                    ($user->company->isDeveloper()
                        ? (
                            $user->can('developer-admin') ||
                            (
                                $user->hasEstatesWithFeature(EstatePremiumFeatures::FEATURE_LOTMIX) &&
                                $user->has_lotmix_access
                            )
                        )
                        : ($user->company->chas_lotmix &&
                            (
                                $user->isBuilderAdmin() ||
                                $user->state->getLotmixAccess($user->company) == LotmixStateSettings::LOTMIX_ACCESS_ENABLED
                            )
                        )
                    )
                );
        });

        Gate::define('chat', function (User $user) {
            return $user->isSalesConsultant() && !config('app.HIDE_CHAT');
        });

        Gate::define('lot-drawer', function (User $user) {
            return $user->company->isDeveloper();
        });

        Gate::define('portal-access', function ($user) {
            /** @var User $user */
            return ($user->has_portal_access == User::PORTAL_ACCESS_CONTRACTOR) ||
                ($user->has_portal_access == User::PORTAL_ACCESS_BUILDER &&
                    $user->can('state-access'));
        });

        $host = $_SERVER['HTTP_X_SITINGS_URL'] ?? request()->getHost();
        $sitingsHost = parse_url(config('app.SITINGS_URL'), PHP_URL_HOST);
        if ($host == $sitingsHost) {
            $this->registerSitingsGates();
        }

        LandspotPassport::routes();

        LandspotPassport::tokensExpireIn(now()->addDays(15));

        LandspotPassport::refreshTokensExpireIn(now()->addDays(30));

        Route::get('oauth/authorize', '\App\Http\Controllers\Auth\OAuth\AuthorizationController@getAuthorize')
            ->middleware(['web', 'auth']);
        Route::post('oauth/authorize', '\App\Http\Controllers\Auth\OAuth\AuthorizationController@postAuthorize')
            ->middleware(['web'])
            ->name('oauth.authorize-post');


        Blog::routes(['middleware' => ['web', 'check.auth.guards']]);

        if (app()->environment('production')) {
            File::setDisk('s3');
        }

        $lotmixHost = parse_url(config('app.LOTMIX_URL'), PHP_URL_HOST);
        if (request()->getHost() == $lotmixHost) {
            Route::group(['middleware' => ['web', 'check.auth.guards', 'slash:add']], function () {
                Route::get('insights', 'Landconnect\Blog\Http\Controllers\PostController@blogIndex')->name('lotmix-insights');
                Route::get('insights/{post}', 'Landconnect\Blog\Http\Controllers\PostController@showBlog')->name('show-insight');
                Route::get('blog', 'Landconnect\Blog\Http\Controllers\PostController@blogIndex')->name('lotmix-blogs');
                Route::get('blog/{post}', 'Landconnect\Blog\Http\Controllers\PostController@showBlog');
            });
        }
    }

    protected function registerSitingsGates()
    {
//        Gate::before(function (User $user) {
//            /** @var User $user */
//            return $user->has_portal_access == User::PORTAL_ACCESS_BUILDER ?: null;
//        });

        Gate::define('contractor', function (User $user) {
            return $user->has_portal_access >= User::PORTAL_ACCESS_CONTRACTOR;
        });

        Gate::define('sitings-global-admin', function (User $user) {
            return $user->isGlobalAdmin();
        });

        Gate::define('create-floorplans', function ($user) {
            /** @var User $user */
            return $user->can('footprints') &&
                !$user->can('contractor') &&
                $user->can('state-access');
        });

        Gate::define('sitings-access', function ($user) {
            /** @var User $user */
            return $user->can('footprints') &&
                $user->can('state-access') &&
                !$user->can('contractor');
        });

        Gate::define('sitings-footprints', function ($user) {
            /** @var User $user */
            return ($user->has_portal_access == User::PORTAL_ACCESS_BUILDER &&
                    $user->can('state-access')) ||
                $user->isGlobalAdmin();
        });
    }
}
