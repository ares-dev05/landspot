<?php

namespace App\Http\Controllers\Sitings\Auth;

use App\Http\Controllers\Auth\UserGuardTrait;
use App\Http\Controllers\Controller;
use App\Models\Sitings\User;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Http\Request;
use Illuminate\Support\{Arr, Str};
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    protected $maxAttempts = 3;
    protected $decayMinutes = 5;
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers, UserGuardTrait;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest')->except(['logout', 'oauthLoginCallback']);
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector|mixed
     * @throws \Exception
     */
    function oauthLoginCallback(Request $request)
    {
        $http = new Client([
            'timeout'         => 10,
            'connect_timeout' => 10
        ]);

        try {
            $config = [
                'form_params' => [
                    'grant_type'    => 'authorization_code',
                    'client_id'     => config('sitings.OAUTH_CLIENT_ID'),
                    'client_secret' => config('sitings.OAUTH_SECRET'),
                    'redirect_uri'  => config('app.SITINGS_URL') . route('sitings-oauth-login-callback', [], false),
                    'code'          => request()->code,
                ]
            ];

            if (App::environment() === 'local') $config['verify'] = false;
            $response = $http->post(config('app.OAUTH_PROVIDER_URL') . '/oauth/token', $config);

            $code        = $response->getStatusCode();
            $contentType = $response->getHeader('Content-Type');
            if ($contentType) $contentType = $contentType[0];
            if ($code !== 200 || !$contentType || strpos($contentType, 'application/json') !== 0) {
                logger()->error(sprintf('Invalid logout response: HTTP_CODE=%s %s', $code, $contentType));
                throw new \Exception('Invalid response. Please try again later.');
            }

            $data = json_decode($response->getBody(), true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                logger()->error('Invalid response: ', $response->getBody()->getContents());
                throw new \Exception('Invalid response. Please try again later.');
            }
        } catch (ClientException $e) {
            info("Oauth ClientException > /oauth/token");
            logger()->error($e->getMessage());

            return $this->redirectWithStatus('Connection problems. Try a direct login form');
        } catch (RequestException $e) {
            info("Oauth RequestException > /oauth/token");
            logger()->error($e->getMessage());

            return $this->redirectWithStatus('Connection problems. Try a direct login form');
        } catch (\Exception $e) {
            logger()->error($e->getMessage());

            return $this->redirectWithStatus('Connection problems. Please try again later');
        }

        $userData = $this->getUserFromAPI($data);

        if ($user = Arr::get($userData, 'user')) {
            return $this->_oauthLogin($request, $user);
        }

        return $userData['error'];
    }

    /**
     * @param Request $request
     * @param User $user
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    protected function _oauthLogin(Request $request, User $user)
    {
        $guard = $user->auth_guard;

        $request->session()->regenerate(true);
        $this->guard($guard)->loginUsingId($user->id);

        /** @var User $user */
        $user         = $this->guard($guard)->user();
        $redirectPath = session()->get('intendedUrl', null);
        if (!$redirectPath) {
            $redirectPath = session()->hasOldInput('intendedUrl')
                ? session()->getOldInput('intendedUrl')
                : $user->can('portal-access')
                    ? route('floorplans.index', [], false)
                    : route('reference-plan', [], false);
        }

        if (Str::is($redirectPath, '/') || strpos($redirectPath, '/oauth/authorize', 0) === 0) {
            $redirectPath = $user->getBaseRoute();
        }

        return $this->authenticated($request, $user)
            ?: redirect($redirectPath);
    }


    /**
     * @param array $data (OAuth access&refresh  token; token type)
     * @return array
     * @throws \Exception
     */
    protected function getUserFromAPI(array $data)
    {
        $accessToken  = $data['access_token'];
        $refreshToken = $data['refresh_token'];

        try {
            $user = User::createOrUpdateFromAPI($accessToken, $refreshToken);

            return compact('user');
        } catch (\Exception $e) {
            $client = \Laravel\Passport\Client
                ::where('id', config('sitings.OAUTH_CLIENT_ID'))
                ->get(['secret'])
                ->first();

            logger()->error(sprintf(
                    "Invalid bearer token response: %s\n%s\n%s\n%s\n%s",
                    $e->getMessage(),
                    config('app.OAUTH_PROVIDER_URL'),
                    config('sitings.OAUTH_CLIENT_ID'),
                    md5(config('sitings.OAUTH_SECRET')),
                    $client ? md5($client->secret) : 'none'
                )
            );

            return ['error' => $e->getMessage()];
        }
    }

    /**
     * @param $status
     * @return \Illuminate\Http\RedirectResponse
     */
    protected function redirectWithStatus($status)
    {
        return redirect(route('sitings-login'))->with('status', $status);
    }

    function login()
    {
        return \SitingsOauthHelper::createOAuthRedirect();
    }

    /**
     * Log the user out of the application.
     *
     * @param \Illuminate\Http\Request $request
     * @param string $nonce
     * @return \Illuminate\Http\Response
     */
    public function logout(Request $request, $nonce)
    {
        if (!\UrlHelper::verifyLogoutNonce($nonce)) {
            return redirect('/');
        }

        $user = auth()->user();
        if ($user) {
            $user->userSession()->delete();
        }

        $this->logoutFromGuards($request);

        return redirect('/');
    }

    /**
     * Get the guard to be used during authentication.
     *
     * @param string $guard
     * @return \Illuminate\Contracts\Auth\StatefulGuard
     */
    protected function guard($guard = null)
    {
        return Auth::guard($guard);
    }
}
