<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Auth\TwoFactorAuthorizationTrait;
use App\Http\Controllers\Controller;
use App\Models\User;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\{Arr, Str};

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

    use AuthenticatesUsers, UserGuardTrait, TwoFactorAuthorizationTrait;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = '/landspot/my-estates';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest')->except(['logout', 'passwordReset', 'oauthLoginCallback']);
    }

    /**
     * Show the application's login form.
     *
     * @param string $brand
     * @return \Illuminate\Http\Response
     */
    public function showLoginForm($brand = 'landspot')
    {
        session()->forget('2FA-TempLoginId');
        if ($user = \UserGuardHelper::checkAuthGuards(true)) {
            return redirect($user->getBaseRoute());
        }

        if (!session('status') && config('app.OAUTH_CLIENT_ID')) {
            $query = http_build_query([
                'client_id'     => config('app.OAUTH_CLIENT_ID'),
                'redirect_uri'  => config('app.url') . route('oauth-login-callback', [], false),
                'response_type' => 'code',
                'scope'         => '',
                'brand'         => $brand
            ]);
            session()->reflash();

            $intendedUrl = session()->get('intendedUrl', null);
            if (!$intendedUrl) {
                session(['intendedUrl' => \UrlHelper::previousRelativeUrl()]);
            }
            logger()->info('OAUTH: redirecting to ' . config('app.OAUTH_PROVIDER_URL') . '/oauth/authorize?' . $query);
            return redirect(config('app.OAUTH_PROVIDER_URL') . '/oauth/authorize?' . $query);
        }

        return view('auth.login-2fa');
    }


    /**
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector|mixed
     * @throws \Exception
     */
    function oauthLoginCallback(Request $request)
    {
        if ($user = \UserGuardHelper::checkAuthGuards(true)) {
            return redirect($user->getBaseRoute());
        }

        $http = new Client([
            'timeout' => 10,
            'connect_timeout' => 10
        ]);

        try {
            $config = [
                'form_params' => [
                    'grant_type'    => 'authorization_code',
                    'client_id'     => config('app.OAUTH_CLIENT_ID'),
                    'client_secret' => config('app.OAUTH_SECRET'),
                    'redirect_uri'  => config('app.url') . route('oauth-login-callback', [], false),
                    'code'          => request()->code,
                ]
            ];

            if (App::environment() === 'local') $config['verify'] = false;
            $response = $http->post(config('app.OAUTH_PROVIDER_URL').'/oauth/token', $config);

            $code = $response->getStatusCode();
            $contentType = $response->getHeader('Content-Type');
            if($contentType) $contentType = $contentType[0];
            if($code !== 200 || !$contentType || strpos($contentType, 'application/json') !== 0) {
                logger()->error(sprintf('Invalid logout response: HTTP_CODE=%s %s', $code, $contentType));
                throw new \Exception('Invalid response. Please try again later.');
            }

            $data = json_decode($response->getBody(), true);

            if(json_last_error() !== JSON_ERROR_NONE) {
                logger()->error('Invalid response: ' . $response->getBody()->getContents());
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

        $userData = $this->getUserFromAPI($http, $data);

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
        $guard = $this->getUserGuard($request, $user);

        $request->session()->regenerate(true);
        $this->guard($guard)->loginUsingId($user->id);

        $request->session()->reflash();

        /** @var User $user */
        $user = $this->guard($guard)->user();
        $redirectPath = session()->get('intendedUrl', null);
        if (!$redirectPath) {
            $redirectPath = session()->hasOldInput('intendedUrl') ? session()->getOldInput('intendedUrl') : $user->getBaseRoute();
        }

        if (
            Str::is($redirectPath, '/') ||
            strpos($redirectPath, '/oauth/authorize', 0) === 0 ||
            $user->can('footprints')
        ) {
            $redirectPath = $user->getBaseRoute();
        }

        return $this->authenticated($request, $user)
            ?: redirect($redirectPath);
    }

    /**
     * @param Client $client
     * @param array $data (OAuth access&refresh  token; token type)
     * @throws \Exception
     * @return array
     */
    protected function getUserFromAPI(Client $client, array $data)
    {
        try {
            $error = false;
            $accessToken = $data['access_token'];
            $refreshToken = $data['refresh_token'];
            $tokenType = $data['token_type'];
            $config = [
                'headers' => [
                    'Authorization' => "$tokenType $accessToken",
                    'Accept' => 'application/json'
                ]
            ];

            if (App::environment() === 'local') $config['verify'] = false;

            $response = $client->get(config('app.OAUTH_PROVIDER_URL') . '/api/user', $config);
            $code = $response->getStatusCode();
            $contentType = $response->getHeader('Content-Type');

            if ($contentType) $contentType = $contentType[0];

            if ($code !== 200 || strpos($contentType, 'application/json') !== 0) {
                $result = \DB::table('oauth_clients')
                    ->where('id', config('app.OAUTH_CLIENT_ID'))
                    ->get(['secret'])
                    ->first();
                $result = $result ? md5($result->secret) : 'none';

                logger()->error(sprintf(
                    "Invalid bearer token response: HTTP_CODE=%s, %s\n%s\n%s\n%s\n%s\n%s",
                        $code,
                        $contentType,
                        $accessToken,
                        config('app.OAUTH_PROVIDER_URL'),
                        config('app.OAUTH_CLIENT_ID'),
                        $result,
                        md5(config('app.OAUTH_SECRET'))
                    )
                );
                $error = $this->redirectWithStatus('Invalid token response. Please try again later.');
            } else {
                $data = json_decode($response->getBody(), true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    logger()->error('Invalid response (bearer): ' . $response->getBody()->getContents());
                    $error = $this->redirectWithStatus('Invalid response. Please try again later.');
                }
            }
        } catch (ClientException $e) {
            info("Oauth ClientException > /api/user");
            logger()->error($e->getMessage());
            $error = $this->redirectWithStatus('Connection problems. Try a direct login form');
        } catch (RequestException $e) {
            info("Oauth RequestException > /api/user");
            logger()->error($e->getMessage());

            $error = $this->redirectWithStatus('Connection problems. Try a direct login form');
        } finally {
            if($error) {
                return compact('error');
            }
        }

        $user = null;
        try {
            $email = Arr::get($data, 'email', 0);

            $user = User::findByEmail($email);

            $user->update([
                'access_token'  => $accessToken,
                'refresh_token' => $refreshToken
            ]);
        } catch (ModelNotFoundException $e) {
            $error = $this->redirectWithStatus('Probably you do not have an account on this platform');
            return compact('error');
        }

        return compact('user');
    }

    /**
     * @param $status
     * @return \Illuminate\Http\RedirectResponse
     */
    protected function redirectWithStatus($status)
    {
        logger()->error('login redirectWithStatus');
        return redirect('login')->with('status', $status);
    }

    /**
     * The user has been authenticated.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  mixed $user
     * @return mixed
     */
    protected function authenticated(Request $request, $user)
    {
        if ($user->last_sign_in_stamp === 0) {
            return redirect(route('reset.invitation.password', [], false));
        }

        if ($user->has_portal_access == User::PORTAL_ACCESS_CONTRACTOR) {
            $guard = $this->getUserGuard($request, $user);
            auth()->guard($guard)->logout();

            $sitingsUrl = config('app.SITINGS_URL') . route('floorplans.index', [], false);
            return redirect($sitingsUrl);
        }

        if ($user->verified === 0) {
            $this->logoutFromGuards($request);

            if (!$user->can('state-access')) {
                logger()->error('login state_id');
                return redirect('login')->with('status', 'Landspot is currently not available in your state. We will keep you posted when its available in your state');
            }
            logger()->error('login Confirm registration');
            return redirect('login')->with('status', 'Confirm registration by going to the link in the letter that we sent you to the mail.');
        } elseif ($user->active === 0) {
            $this->logoutFromGuards($request);

            logger()->error('login Your account is inactive');
            return redirect('login')->with('status', 'Your account is inactive. Please contact us <a href="mailto:support@landspot.com.au">support@landspot.com.au</a> for details');
        }

        if ($user->can('footprints') && !$user->can('state-access')) {
            $guard = $this->getUserGuard($request, $user);
            auth()->guard($guard)->logout();

            return redirect(config('app.FOOTPRINTS_URL'));
        } elseif (!$user->can('state-access')) {
            logger()->error('login state_id');
            return redirect('login')->with('status', 'Landspot is currently not available in your state. We will keep you posted when its available in your state');
        }
    }

    /**
     * Log the user out of the application.
     *
     * @param  \Illuminate\Http\Request $request
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

    /**
     * @param Request $request
     * @throws ValidationException
     */
    protected function sendLockoutResponse(Request $request)
    {
        throw ValidationException::withMessages([
            'show_recaptcha' => true,
        ])->status(423);
    }


    protected function throttleKey(Request $request)
    {
        return 'login|' . $request->ip();
    }

    /**
     * @param $request
     * @return array
     */
    protected function sendAjaxLoginResponse($request)
    {
        $request->session()->regenerate(true);

        $user = auth()->user();
        if ($user) {
            $user->userSession()->delete();
        }

        $this->clearLoginAttempts($request);

        $request->session()->reflash();
        $redirectPath = session()->get('intendedUrl', null);

        if (!$redirectPath) {
            $redirectPath = session()->hasOldInput('intendedUrl') ? session()->getOldInput('intendedUrl') : '/';
        }

        /** @var RedirectResponse $redirect */
        $redirect = $this->authenticated($request, $this->guard()->user()) ?: redirect($redirectPath);

        return [
            'REDIRECT_URL' => $redirect ? \UrlHelper::absoluteToRelativeUrl($redirect->getTargetUrl()) : '/'
        ];
    }

    /**
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    function login2FA(Request $request)
    {
        return $this->validate2FALogin($request, false) ?: $this->sendAjaxLoginResponse($request);
    }

    /**
     * Validate the user login request.
     *
     * @param  \Illuminate\Http\Request $request
     * @return void
     * @throws \Exception
     */
    protected function validateLogin(Request $request)
    {
        $rules = [
            $this->username() => 'required|string',
            'password'        => 'required|string',
        ];

        $hasTooManyLoginAttempts = $this->hasTooManyLoginAttempts($request);
        if ($hasTooManyLoginAttempts) {
            $rules['g-recaptcha-response'] = 'required|recaptcha';
        }

        $this->validate($request, $rules);

        if ($hasTooManyLoginAttempts) {
            $this->clearLoginAttempts($request);
        }
    }
}
