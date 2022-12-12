<?php

namespace Landconnect\Blog\Http\Middleware;

use Closure;

class CheckBlogAccess
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
        $blogConnections = config('database.BLOG_DATABASES');
        $host = $_SERVER['HTTP_X_INSIGHTS_URL'] ?? $request->getHost();
        if ($blogConnections) {
            $blogConnections = str_replace([',', ';'], '###', $blogConnections);
            $blogConnections = explode('###', $blogConnections);

            if (in_array($host, $blogConnections)) {
                return $next($request);
            }
        }

        abort(403, 'Unauthorized action.');
    }
}
