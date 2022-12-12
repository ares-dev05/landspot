<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\RedirectResponse;

class RedirectToRelativeUrls
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        /** @var RedirectResponse $response */
        $response = $next($request);
        if ($response instanceof RedirectResponse) {
            $url = $response->getTargetUrl();

            $url = \UrlHelper::absoluteToRelativeUrl($url);

            $response->setTargetUrl($url);
        }

        return $response;
    }
}
