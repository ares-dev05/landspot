<?php

namespace App\Http\Middleware;

use Closure;

class AuthUser
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
            return $next($request);
        } else {
            return \request()->expectsJson()
                ? abort(403, 'Unauthorized action.')
                : redirect('login');
        }
    }
}
