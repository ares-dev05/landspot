<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\InvitedUser;
use App\Http\Controllers\Lotmix\Auth\UserInvitationTrait;

class CheckBriefInvitedUser
{
    use UserInvitationTrait;

    /**
     * Handle an incoming request.
     *
     * @param \Illuminate\Http\Request $request
     * @param \Closure $next
     * @param mixed $guard
     * @return mixed
     */
    public function handle($request, Closure $next, $guard)
    {
        if (auth()->guard($guard)->check()) auth()->shouldUse($guard);

        if (empty($guard)) {
            \UserGuardHelper::checkAuthGuards();
        }

        /** @var InvitedUser $user */
        $authUser = auth()->user();

        if (!$authUser) {
            $user = InvitedUser::where('email', $request->email)->firstOrFail();

            if ($user->password === $request->password) {
                $this->loginUser($user);
                auth()->shouldUse($guard);
                $authUser = auth()->user();
            }
        }

        if ($authUser && $authUser->userInvitationsBrief->count()) {
            return $next($request);
        }
        return abort(403, 'Unauthorized action.');
    }
}
