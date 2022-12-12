<?php

namespace App\Http\Controllers\Auth\OAuth;

use App\Http\Controllers\Auth\TwoFactorAuthorizationTrait;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

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

    use BrandThemeTrait, AuthenticatesUsers, TwoFactorAuthorizationTrait;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = '/';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest')->except('logout', 'logoutFromAPI');
    }

    /**
     * Show the application's login form.
     *
     * @param Request $request
     * @param string $brand
     * @return \Illuminate\Http\Response
     */
    public function showLoginForm(Request $request, $brand = 'sitings')
    {
        session([
            'intendedUrl' => \UrlHelper::previousRelativeUrl(),
            'brand'        => $brand
        ]);
        session()->forget('2FA-TempLoginId');

        $theme = $this->getBrandColors($brand);
        $navUrl = $this->getBrandBasePath($brand);

        $uri = parse_url(session()->get('url.intended'));

        $formActionUrl = null;
        if(isset($uri['path']) && isset($uri['query'])) {
            $formActionUrl = strpos($uri['path'], '/oauth/authorize') === 0
                ? $uri['path'] . '?'. $uri['query']
                : null;
        }

        return view('auth.oauth.login-sso-2fa', compact('brand', 'theme', 'navUrl', 'formActionUrl'));
    }

    /**
     * Send the response after the user was authenticated.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response|array
     */
    protected function sendLoginResponse(Request $request)
    {
        $request->session()->regenerate(true);

        $this->clearLoginAttempts($request);

        $request->session()->reflash();
        $redirectPath = session()->get('intendedUrl', null);
        if (!$redirectPath) {
            $redirectPath = session()->hasOldInput('intendedUrl') ? session()->getOldInput('intendedUrl') : '/';
        }

        $redirect = $request->expectsJson() ? ['REDIRECT_URL' => $redirectPath] : redirect($redirectPath);

        return $this->authenticated($request, $this->guard()->user())
            ?: $redirect;
    }

    /**
     * Log the user out of the application.
     *
     * @param  \Illuminate\Http\Request $request
     * @param $nonce
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

        $this->guard()->logout();

        $request->session()->invalidate();

        return redirect('/');
    }

    function logoutFromAPI(Request $request)
    {
        /** @var \App\Models\User $user */

        $user = $request->user();
        $user->tokens()->each(function (\Laravel\Passport\Token $token) {
            $token->revoke();
        });

        $user->userSession()->delete();
        $user->update([
            'access_token' => null,
            'refresh_token' => null
        ]);

        $user->logoutFromFootprints();

        return response()->json(['message' => 'Successfully logged out']);
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
}
