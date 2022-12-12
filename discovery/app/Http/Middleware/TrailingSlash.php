<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class TrailingSlash
{
    /**
     * @var Request
     */
    private $request;
    private $flag;

    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     * @param string $flag
     * @return mixed
     */
    public function handle(Request $request, Closure $next, string $flag)
    {
        if ($request->ajax() || $request->expectsJson()) {
            return $next($request);
        }

        $this->request = $request;
        $this->flag = $flag;

        if ($this->isSlashAdd()) {
            $response = $request->root() . $request->getRequestUri() . '/';
            if ($this->hasQuery()) {
                $response = $request->url() . '/?' . $request->getQueryString();
            }
            return redirect($response, 301);
        } else if ($this->isSlashRemove()) {
            $response = rtrim($request->root() . $request->getRequestUri(), '/');
            if ($this->hasQuery()) {
                $response = rtrim($request->url() . '?' . $request->getQueryString(), '/?');
            }
            return redirect($response, 301);
        }

        return $next($request);
    }

    /**
     * @return bool
     */
    private function hasSlash(): bool
    {
        $requestUri = substr($this->request->getRequestUri(), 0, strpos($this->request->getRequestUri(), "?"));
        return !empty($requestUri)
            ? $this->hasTrailingSlash($requestUri)
            : $this->hasTrailingSlash($this->request->getRequestUri());
    }

    /**
     * @return bool
     */
    private function isSlashAdd(): bool
    {
        return $this->flag == 'add' && !$this->hasSlash();
    }

    /**
     * @return bool
     */
    private function isSlashRemove(): bool
    {
        return $this->flag == 'remove' && !$this->hasSlash();
    }

    /**
     * @return bool
     */
    private function hasQuery(): bool
    {
        return (bool)strpos($this->request->getRequestUri(), '?');
    }

    /**
     * @param $string
     * @return bool
     */
    private function hasTrailingSlash($string): bool
    {
        return (bool)preg_match('/[\/]+$/', $string);
    }
}
