<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{

    /**
     * The priority-sorted list of middleware.
     *
     * Forces the listed middleware to always be in the given order.
     *
     * @var array
     */
    protected $middlewarePriority = [
        \App\Http\Middleware\CheckLotmixRoute::class,
        \App\Http\Middleware\CheckAjax::class,
    ];

    /**
     * The application's global HTTP middleware stack.
     *
     * These middleware are run during every request to your application.
     *
     * @var array
     */
    protected $middleware = [
        \Illuminate\Foundation\Http\Middleware\CheckForMaintenanceMode::class,
        \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,
        \App\Http\Middleware\TrimStrings::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
        \App\Http\Middleware\TrustProxies::class,
        \App\Http\Middleware\NoCache::class,
    ];

    /**
     * The application's route middleware groups.
     *
     * @var array
     */
    protected $middlewareGroups = [
        'web' => [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            // \Illuminate\Session\Middleware\AuthenticateSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            \Laravel\Passport\Http\Middleware\CreateFreshApiToken::class,
            \App\Http\Middleware\RedirectToRelativeUrls::class
        ],

        'api' => [
            'throttle:60,1',
            'bindings',
        ],
    ];

    /**
     * The application's route middleware.
     *
     * These middleware may be assigned to groups or used individually.
     *
     * @var array
     */
    protected $routeMiddleware = [
        'auth' => \Illuminate\Auth\Middleware\Authenticate::class,
        'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
        'bindings' => \Illuminate\Routing\Middleware\SubstituteBindings::class,
        'can' => \Illuminate\Auth\Middleware\Authorize::class,
        'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
        'check.ajax' => \App\Http\Middleware\CheckAjax::class,
        'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
        'check.user' => \App\Http\Middleware\CheckUser::class,
        'check.auth.guards' => \App\Http\Middleware\CheckAuthGuards::class,
        'auth.user' => \App\Http\Middleware\AuthUser::class,
        'check.invitation.token' => \App\Http\Middleware\CheckInvitationToken::class,
        'check.invited.user' => \App\Http\Middleware\CheckInvitedUser::class,
        'check.brief.invited.user' => \App\Http\Middleware\CheckBriefInvitedUser::class,
        'scopes' => \Laravel\Passport\Http\Middleware\CheckScopes::class,
        'scope' => \Laravel\Passport\Http\Middleware\CheckForAnyScope::class,

        'sitings.check.ajax' => \App\Http\Middleware\Sitings\CheckAjax::class,
        'sitings.check.user' => \App\Http\Middleware\Sitings\CheckUser::class,
        'lot.drawer' => \App\Http\Middleware\LotDrawerMiddleware::class,
        'slash' => \App\Http\Middleware\TrailingSlash::class,
        'check.lotmix.route' => \App\Http\Middleware\CheckLotmixRoute::class
    ];
}
