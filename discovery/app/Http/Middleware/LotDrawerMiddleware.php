<?php

namespace App\Http\Middleware;

use App\Models\Estate;
use App\Models\Lot;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Gate;

class LotDrawerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Closure $next
     * @return mixed
     * @throws AuthorizationException
     */
    public function handle($request, Closure $next)
    {
        $estate = null;
        if (request()->is('*/stage*')) {
            $estate = Estate::find(request()->route()->parameter('estate'));
        } elseif ($lot = Lot::find(request()->route()->parameter('estate'))) {
            $estate = $lot->stage->estate;
        }

        if ($estate && Gate::allows('premiumFeature', [$estate, 'lot-drawer'])) {
            return $next($request);
        } else {
            throw new AuthorizationException('This action is unauthorized.');
        }
    }
}
