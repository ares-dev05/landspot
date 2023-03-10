<?php

use App\Http\Controllers\Api\BuildOptionController;
use App\Http\Controllers\Auth\OAuth\AuthorizationController;
use App\Models\User;
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

Route::domain(config('app.LOTMIX_URL'))->group(function () {
    Route::group(['prefix' => 'v1',], function () {
        Route::post('auth/token', [AuthorizationController::class, 'accessToken']);
        Route::view('/test-content', 'build-options.index')->name('test-content');

        Route::middleware(['auth:api', sprintf('scopes:%s', User::TOKEN_SCOPE_API_ONLY_ACCESS)])->group(function () {
            Route::resource('build-options', BuildOptionController::class);
            Route::get('available-suburbs', [BuildOptionController::class, 'getAvailableSuburbs']);
        });
    });
});
