<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Lotmix\Auth\UserInvitationTrait;
use App\Models\UserInvitedUsers;
use Closure;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class CheckInvitationToken
{
    use UserInvitationTrait;
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if (!$request->route()->hasParameters()) {
            return redirect('/');
        }

        $token           = $request->route()->parameter('token');
        $invitationToken = $this->checkToken($token);

        try {
            UserInvitedUsers::byToken($invitationToken)->firstOrFail();
        } catch (ModelNotFoundException $e) {
            return redirect('/')
                ->with('status', 'The invitation token has expired or does not exist.');
        }

        return $next($request);
    }
}
