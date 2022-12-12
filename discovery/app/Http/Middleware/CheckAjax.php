<?php

namespace App\Http\Middleware;

use Closure;

class CheckAjax
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Closure $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $lotmixHost = parse_url(config('app.LOTMIX_URL'), PHP_URL_HOST);
        $response   = (request()->getHost() == $lotmixHost)
            ? response()->view('lotmix.user.spa')
            : response('Bad Request.', 400);

        return ($request->ajax() || $request->expectsJson())
            ? $next($request)
            : $response;
    }
}
