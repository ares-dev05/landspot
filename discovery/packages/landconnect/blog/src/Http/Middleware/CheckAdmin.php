<?php

namespace Landconnect\Blog\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class CheckAdmin
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
        if (auth()->guard('globalAdmin')->check()) {
            auth()->shouldUse('globalAdmin');
            return $next($request);
        } else {
            session()->flash('intendedUrl', $this->currentRelativeUrl());
            logger()->error('login check.user Unauthorized action');
            return \request()->expectsJson()
                ? abort(403, 'Unauthorized action.')
                : redirect(route('insights.login-form', [], false))->withInput(['intendedUrl' => \UrlHelper::currentRelativeUrl()]);
        }
    }

    function currentRelativeUrl()
    {
        if (null !== $qs = request()->getQueryString()) {
            $qs = '?' . $qs;
        }

        return request()->getPathInfo() . $qs;
    }
}
