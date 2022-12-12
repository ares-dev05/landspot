<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class NoCache
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next, ...$guards)
    {
        $response = $next($request);
        if ($response instanceof Response or $response instanceof JsonResponse) {
            $response->header('Cache-Control', 'no-cache, max-age=0, s-max-age=0, must-revalidate, no-store');
        }
        return $response;
    }
}
