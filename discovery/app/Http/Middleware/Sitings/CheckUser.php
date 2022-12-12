<?php

namespace App\Http\Middleware\Sitings;

use Closure;

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
        if (auth()->guard('web')->check()) {
            abort(403, 'Unauthorized action.');
        }

        foreach ($guards as $guard) {
            if (auth()->guard($guard)->check()) auth()->shouldUse($guard);
        }

        if (!$guards) {
            \UserGuardHelper::checkAuthGuards();
        }

        $user = auth()->user();

        if ($user) {
            return $next($request);
        } else {
            if (auth()->guard('globalAdmin')->check()) {
                auth()->shouldUse('globalAdmin');
                return $next($request);
            }
            session()->flash('intendedUrl', \UrlHelper::currentRelativeUrl());
            return \request()->expectsJson()
                ? abort(403, 'Unauthorized action.')
                : \SitingsOauthHelper::createOAuthRedirect();
        }
    }
}
