<?php

namespace App\Packages\Passport;

use Illuminate\Support\Facades\Route;

class LandspotPassport extends \Laravel\Passport\Passport
{
    public static function routes($callback = null, array $options = [])
    {
        $callback = $callback ?: function ($router) {
            $router->all();
        };

        $defaultOptions = [
            'prefix'    => 'oauth',
            'namespace' => '\Laravel\Passport\Http\Controllers',
        ];

        $options = array_merge($defaultOptions, $options);

        Route::group($options, function ($router) use ($callback) {
            $callback(new PassportRouteRegistrar($router));
        });

        //Landconnect routes
        Route::get('oauth/authorize', '\App\Http\Controllers\Auth\OAuth\AuthorizationController@getAuthorize')
            ->middleware(['web', 'auth']);
        Route::post('oauth/authorize', '\App\Http\Controllers\Auth\OAuth\AuthorizationController@postAuthorize')
            ->middleware(['web'])
            ->name('oauth.authorize-post');
    }
}