<?php

namespace App\Http\Controllers\Auth\OAuth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\SendsPasswordResetEmails;
use Illuminate\Http\Request;

class ForgotPasswordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset emails and
    | includes a trait which assists in sending these notifications from
    | your application to your users. Feel free to explore this trait.
    |
    */

    use BrandThemeTrait, SendsPasswordResetEmails;

    /**
     * Display the form to request a password reset link.
     *
     * @param Request $request
     * @param string $brand
     * @return \Illuminate\Http\Response
     */
    public function showLinkRequestForm(Request $request, $brand = 'sitings')
    {
        session()->put(['brand' => $brand]);

        $theme = $this->getBrandColors($brand);
        $navUrl = $this->getBrandBasePath($brand);
        return view('auth.oauth.passwords.email', compact('brand', 'theme', 'navUrl'));
    }

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
    }
}
