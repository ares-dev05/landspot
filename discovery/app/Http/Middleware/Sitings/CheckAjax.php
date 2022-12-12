<?php

namespace App\Http\Middleware\Sitings;

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
        return ($request->ajax() || $request->expectsJson())
            ? $next($request)
            : response()->view('sitings.app.index');
    }
}
