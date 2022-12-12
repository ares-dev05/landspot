<?php

namespace Landconnect\Blog\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Landconnect\Blog\Http\Controllers\BrandThemeTrait;

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

    use AuthenticatesUsers, BrandThemeTrait;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = '/insights/admin';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest')->except(['logout']);
    }

    /**
     * Show the application's login form.
     *
     * @return \Illuminate\Http\Response
     */
    public function showLoginForm()
    {
        if ($user = auth()->guard('globalAdmin')->check()) {
            return redirect($this->redirectTo);
        }

        $theme = $this->getBrandColors();
        return view('blog::admin.auth.login', compact('theme'));
    }

    /**
     * Send the response after the user was authenticated.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    protected function sendLoginResponse(Request $request)
    {
        $request->session()->regenerate(true);
        $this->clearLoginAttempts($request);

        return $this->authenticated($request, $this->guard('globalAdmin')->user())
            ?: redirect($this->redirectTo);
    }

    /**
     * Attempt to log the user into the application.
     *
     * @param  \Illuminate\Http\Request $request
     * @return bool
     */
    protected function attemptLogin(Request $request)
    {
        $credentials = $this->credentials($request);

        return $this->guard('globalAdmin')->attempt(
            $credentials, $request->filled('remember')
        );
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
        if (!$user->isGlobalAdmin()) {
            $this->logout($request);
            return redirect(route('insights.login-form', [], false))->with('status', 'Only admins can manage insights posts');
        }
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

    /**
     * Validate the user login request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return void
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

    protected function throttleKey(Request $request)
    {
        return 'login|' . $request->ip();
    }
}
