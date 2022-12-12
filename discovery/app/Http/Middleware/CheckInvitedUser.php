<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Lotmix\Auth\UserInvitationTrait;
use App\Models\InvitedUser;
use Closure;

class CheckInvitedUser
{
    use UserInvitationTrait;
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

        /** @var InvitedUser $user */
        if ($user = auth()->user()) {
            if ($user->isGlobalAdmin() && (request()->is('insights*') || request()->is('profile'))) {
                return $next($request);
            } elseif ($user->isGlobalAdmin()) {
                abort(403, 'Unauthorized action.');
            }
            return $this->checkUserInvitations($user) ?: $next($request);
        } else {
            return \request()->expectsJson()
                ? abort(403, 'Unauthorized action.')
                : redirect('login');
        }

    }
}
