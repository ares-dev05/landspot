<?php

namespace App\Http\Controllers\Auth;

use App\Models\{
    User, UserGroup
};
use GuzzleHttp\Client;
//use GuzzleHttp\Cookie\CookieJar;
use GuzzleHttp\Exception\{
    BadResponseException, ClientException, ServerException
};
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

/**
 * Trait UserGuardTrait
 */

trait UserGuardTrait
{

    /**
     * Get current User guard.
     *
     * @param  \Illuminate\Http\Request $request
     * @param User $user
     * @return string
     */
    protected function getUserGuard(Request $request, User $user = null)
    {
        if (!$user) {
            $credentials = $this->credentials($request);
            try {
                $user = User::findByEmail($credentials['email']);
            } catch (ModelNotFoundException $e) {
                $user = null;
            }
        }

        return $user ? $user->authGuard : 'web';
    }

    /**
     * Log the user out of all guards.
     *
     * @param  \Illuminate\Http\Request $request
     * @return $this
     */
    protected function logoutFromGuards(Request $request)
    {
        $guards = array_keys(config('auth.guards'));
        foreach ($guards as $guard) {
            if (auth()->guard($guard)->check()) {
                if (config('app.OAUTH_CLIENT_ID')) {
                    $this->logoutFromSso(auth()->guard($guard)->user());
                }
                auth()->guard($guard)->logout();
            }
        }

        $request->session()->invalidate();

        return $this;
    }

    protected function logoutFromSso(User $user)
    {
        $token = $user->access_token;
        if (!$token) {
            return;
        }
        $http = new Client;

        try {
            $config = [
                'headers' => [
                    'Authorization' => "Bearer $token",
                    'Accept' => 'application/json'
                ]
            ];
            if (App::environment() === 'local') $config['verify'] = false;

            $response = $http->post(config('app.OAUTH_PROVIDER_URL') . '/api/logout', $config);
            $code = $response->getStatusCode();
            $contentType = $response->getHeader('Content-Type');
            if($contentType) $contentType = $contentType[0];
            if($code !== 200 || !$contentType || strpos($contentType, 'application/json') !== 0) {
                logger()->error(sprintf('Invalid logout response: HTTP_CODE=%s %s', $code, $contentType));
                return;
            }
        } catch (ClientException $e) {
            logger()->info("Oauth ClientException > /api/logout");
            logger()->error($e->getMessage());
        } catch (ServerException $e) {
            logger()->info("Oauth ServerException > /api/logout");
            logger()->error($e->getMessage());
        } catch (BadResponseException $e) {
            logger()->info("Oauth BadResponseException > /api/logout");
            logger()->error($e->getMessage());
        }
    }
}
