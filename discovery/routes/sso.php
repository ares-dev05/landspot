<?php

/*
|--------------------------------------------------------------------------
| Sso Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::domain(config('app.OAUTH_PROVIDER_URL'))->group(function () {
//    Auth::routes();

    Route::any('/', function () {
        if (auth()->check()) {
            return redirect(config('app.FOOTPRINTS_URL'));
        }
        logger()->error('login sso redirect');
        return redirect('login');
    });

    Route::any('register', function () {
        logger()->error('login register');
        return redirect('login');
    });

    // Authentication Routes...
    Route::get('login', 'Auth\OAuth\LoginController@showLoginForm')->name('login');
    Route::get('login/config', 'Auth\OAuth\LoginController@getLoginConfig');
    Route::post('login/sendSMS', 'Auth\OAuth\LoginController@sendSMSForLogin');

    Route::post('login', 'Auth\OAuth\LoginController@login');
    Route::get('logout/{nonce}', 'Auth\OAuth\LoginController@logout')->name('logout');

    // Password Reset Routes...
    Route::get('password/reset/{token}', 'Auth\OAuth\ResetPasswordController@showResetForm')->name('password.reset');
    Route::post('password/reset', 'Auth\OAuth\ResetPasswordController@reset');
    Route::get('password/reset', 'Auth\OAuth\ForgotPasswordController@showLinkRequestForm')->name('password.request');
    Route::post('password/email', 'Auth\OAuth\ForgotPasswordController@sendResetLinkEmail')->name('password.email');

    Route::get('{brand}/login', 'Auth\OAuth\LoginController@showLoginForm')->name('brand.login');

    Route::get('{brand}/password/reset', 'Auth\OAuth\ForgotPasswordController@showLinkRequestForm')
        ->name('brand.password.request');

    Route::get('{brand}/password/reset/{token}', 'Auth\OAuth\ResetPasswordController@showResetForm');

    Route::post('error-handler', 'ErrorHandlerController@catchError');
});