<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class CheckUser
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  string[] ...$guards
     * @param  \Closure $next
     * @return mixed
     */
    public function handle($request, Closure $next, ...$guards)
    {
        foreach ($guards as $guard) {
            if (auth()->guard($guard)->check()) auth()->shouldUse($guard);
        }

        if (empty($guards)) {
            \UserGuardHelper::checkAuthGuards();
        }

        if ($user = auth()->user()) {
            if ($user->last_sign_in_stamp === 0) {
                return redirect(route('reset.invitation.password', [], false));
            }

            $oauthHost = parse_url(config('app.OAUTH_PROVIDER_URL'), PHP_URL_HOST);

            if ($user->company->isBuilder() &&
                !$user->isGlobalAdmin() &&
                !$user->can('estates-access-company') &&
                request()->getHost() != $oauthHost
            ) {
                if (request()->is('landspot/*') &&
                    !request()->is('landspot/user-manager/*')) {
                    return \request()->expectsJson()
                        ? abort(403, 'Unavailable feature')
                        : redirect('discovery');
                }
            }

            return $next($request);
        } else {
            if (auth()->guard('globalAdmin')->check()) {
                auth()->shouldUse('globalAdmin');
                return $next($request);
            }
            session()->flash('intendedUrl', \UrlHelper::currentRelativeUrl());
            logger()->error('login check.user Unauthorized action');
            return \request()->expectsJson()
                ? abort(403, 'Unauthorized action.')
                : redirect('login')->withInput(['intendedUrl' => \UrlHelper::currentRelativeUrl()]);
        }

    }
}
