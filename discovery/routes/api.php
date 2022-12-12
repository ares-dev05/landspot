<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->group(function () {
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        $user->append('auth_guard');

        return $user;
    });

    Route::get('/company', function (Request $request) {
        /** @var \App\Models\Company $company */
        $company = $request->user()->company;
        $company->append('hasFootprints');
        $company->setVisible(['id', 'name', 'type', 'hasFootprints', 'company_logo', 'company_small_logo', 'company_expanded_logo']);

        return $company;
    });
});

Route::domain(config('app.OAUTH_PROVIDER_URL'))->group(function () {
    Route::middleware('auth:api')->post('/logout', '\App\Http\Controllers\Auth\OAuth\LoginController@logoutFromAPI');
});
