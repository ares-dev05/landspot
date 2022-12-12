<?php

namespace App\Http\Controllers\Lotmix\Auth;

use App\Http\Controllers\Controller;
use App\Models\InvitedUser;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;

//TODO: deprecated
class LoginController extends Controller
{
    protected $maxAttempts = 3;
    protected $decayMinutes = 5;

    use AuthenticatesUsers, UserInvitationTrait;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = '/home';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest')->except(['logout', 'passwordReset']);
    }

    /**
     * Show the application's login form.
     *
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View|\Illuminate\Routing\Redirector
     */
    public function showLoginForm()
    {
        if ($user = \UserGuardHelper::checkAuthGuards(true)) {
            return redirect($user->getBaseRoute());
        }

        return view('lotmix.auth.login');
    }

    /**
     * Redirect the user to the GitHub authentication page.
     *
     * @param string $provider
     * @param string $token
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function redirectToProvider($provider, $token = '')
    {
        if ($token) {
            $this->checkToken($token);
        }

        session()->put(compact('token'));

        return Socialite::driver($provider)->redirect();
    }

    /**
     * Obtain the user information from GitHub.
     *
     * @param string $provider
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    public function handleProviderCallback(string $provider)
    {
        $token = session()->get('token');

        $user = Socialite::driver($provider)->user();
        $email = $user->getEmail();

        try {
            $invitedUser = InvitedUser::byEmail($email)->firstOrFail();
        } catch (\Exception $e) {
            return redirect('login')->with('status', 'Probably you do not have an account on this platform');
        }

        if ($token) {
            $this->checkToken($token);
            $this->confirmInvitation($invitedUser, $token);
        }

        return $this->checkUserInvitations($invitedUser) ?: $this->oauthLogin($invitedUser);
    }

    protected function oauthLogin(InvitedUser $invitedUser)
    {
        $this->loginUser($invitedUser);
        $this->acceptPendingInvitations($invitedUser);
        return redirect($invitedUser->getBaseRoute());
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
     * The user has been authenticated.
     *
     * @param \Illuminate\Http\Request $request
     * @param mixed $user
     * @return mixed
     */
    protected function authenticated(Request $request, $user)
    {
        $redirect = $this->checkUserInvitations($user);
        if ($redirect) {
            return $redirect;
        }
        $user->update([
            'last_sign_in_stamp' => time()
        ]);

        if ($user->userInvitationsBrief->count()) {
            return redirect()->route('enquire-once.profile');
        }

        $this->acceptPendingInvitations($user);
    }

    /**
     * Validate the user login request.
     *
     * @param \Illuminate\Http\Request $request
     * @return void
     * @throws \Exception
     */
    protected function validateLogin(Request $request)
    {
        $rules = [
            $this->username() => 'required|string',
            'password' => 'required|string',
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

    /**
     * Send the response after the user was authenticated.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    protected function sendLoginResponse(Request $request)
    {
        $request->session()->regenerate();

        $this->clearLoginAttempts($request);

        /** @var InvitedUser $user */
        $user = $this->guard()->user();
        return $this->authenticated($request, $this->guard()->user())
            ?: redirect($user->getBaseRoute());
    }

    /**
     * Log the user out of the application.
     *
     * @param \Illuminate\Http\Request $request
     * @param string $nonce
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector|array
     */
    public function logout(Request $request, $nonce)
    {
        if (!\UrlHelper::verifyLogoutNonce($nonce)) {
            return redirect('/');
        }

        if ($this->guard()->check()) {
            /** @var InvitedUser $user */
            if ($user = $this->guard()->user()) {
                $user->userSession()->delete();
            }

            $this->guard()->logout();
        }
        $request->session()->invalidate();

        if (\request()->expectsJson()) {
            return [
                'user' => null
            ];
        }

        return redirect('/');

    }

    /**
     * Get the guard to be used during authentication.
     *
     * @param string $guard
     * @return \Illuminate\Contracts\Auth\StatefulGuard
     */
    protected function guard($guard = 'invitedUser')
    {
        return auth()->guard($guard);
    }
}