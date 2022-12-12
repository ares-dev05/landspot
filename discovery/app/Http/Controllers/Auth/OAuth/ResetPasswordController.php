<?php

namespace App\Http\Controllers\Auth\OAuth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Foundation\Auth\ResetsPasswords;
use Illuminate\Http\Request;

class ResetPasswordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset requests
    | and uses a simple trait to include this behavior. You're free to
    | explore this trait and override any methods you wish to tweak.
    |
    */

    use BrandThemeTrait, ResetsPasswords;

    /**
     * Where to redirect users after resetting their password.
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
        $this->middleware('guest');
    }

    /**
     * Display the password reset view for the given token.
     *
     * If no token is present, display the link request form.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string|null  $token
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function showResetForm(Request $request, $token = null)
    {
        $brand = session()->get('brand', 'sitings');
        $theme = null;
        $navUrl = null;

        if ($token) {
            $user = User::getUserByPasswordToken($token);
            if($user && $user->company->isBuilder()) {
                $theme = $this->getBrandColors($user->company->domain);
                $navUrl = 'https://' . $user->company->domain;
            }
        }

        if (!$theme) {
            $theme = $this->getBrandColors($brand);
        }

        if(!$navUrl) {
            $navUrl = $this->getBrandBasePath($brand);
        }

        return view('auth.oauth.passwords.reset', compact('brand', 'theme', 'navUrl'))->with(
            ['token' => $token, 'email' => $request->email]
        );
    }

    /**
     * Get the response for a successful password reset.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $response
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    protected function sendResetResponse($request, $response)
    {
        $redirectPath = session()->get('intendedUrl', '/');

        return redirect($redirectPath)
            ->with('status', trans($response));
    }
}
