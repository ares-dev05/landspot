<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::any('sitings', function () {
    return redirect(route('reference-plan', [], false));
});

Route::group([
    'prefix' => 'sitings',
], function () {
    Route::get('/login', 'Auth\LoginController@login')->name('sitings-login');
    Route::get('/auth/callback', 'Auth\LoginController@oauthLoginCallback')->name('sitings-oauth-login-callback');
    Route::get('/logout/{nonce}', 'Auth\LoginController@logout')->name('sitings-logout');

    Route::group([
        'prefix' => 'plans',
        'middleware' => 'sitings.check.user:sitingsBuilder,contractor'
    ], function () {
        Route::get('download/svg/{floorplan}', 'DownloadController@getSVG');
        Route::get('download/dwg/{floorplan}', 'DownloadController@getFloorplanZIP')->name('download.floorplan-zip');
        Route::get('download/floorplan/{file}', 'DownloadController@getFloorplanDWG')->name('download.floorplan');
    });

    Route::group([
        'prefix' => 'drawer',
        'middleware' => 'sitings.check.user:sitingsBuilder'
    ], function () {
        Route::get('/download/pdf/{siting}', 'SitingController@exportPdf');
    });

    Route::group(['middleware' => ['sitings.check.user:sitingsBuilder', 'sitings.check.ajax']], function () {
        Route::group([
            'prefix' => 'drawer',
        ], function () {
            Route::resource('/reference-plan', 'ReferencePlanController')
                ->only(['index', 'store'])
                ->names([
                    'index' => 'reference-plan',
                ]);

            Route::resource('/engineering-plan', 'EngineeringPlanController')
                ->only(['index', 'store'])
                ->names([
                    'index' => 'engineering-plan',
                ]);

                Route::resource('/siting', 'SitingController');
                Route::put('/resite/{siting}', 'SitingController@resiteLot');
                Route::get('/siting/plan/{siting}', 'SitingController@getPlan');
                Route::get('/siting/company-data/{siting}', 'SitingController@getCompanyXml')->name('company-data');
                Route::get('/siting/company-theme/{siting}', 'SitingController@getCompanyTheme')->name('company-theme');
                Route::get('/siting/house-data/{siting}/{house}', 'SitingController@getHouseData')->name('house-data');
                Route::get('/siting/envelope-catalogue/{siting}', 'SitingController@getEnvelopeCatalogueXml')->name('envelope-catalogue');
                Route::get('/siting/facade-catalogue/{siting}', 'SitingController@getFacadeCatalogueXml')->name('facade-catalogue');
                Route::get('/siting/house-svg/{siting}/{house}', 'SitingController@getHouseSVG')->name('house-svg');
                Route::get('/get-clients/{siting}', 'SitingController@getAvailableClients');
            });
        });

    Route::group(['middleware' => ['sitings.check.user:sitingsBuilder,contractor', 'sitings.check.ajax']], function () {
        Route::get('/profile', 'ProfileController@index');

        Route::group([
            'prefix' => 'plans',
            'middleware' => 'can:portal-access'
        ], function () {
            Route::resource('/floorplans', 'FloorplanController');
            Route::post('/upload-document', 'FloorplanController@uploadFile');
            Route::resource('/floorplans/history', 'FloorplanHistoryController', [
                'only' => ['show', 'update'],
                'parameters' => ['history' => 'floorplan']
            ]);
            Route::get('/floorplans/files/{floorplan}', 'FloorplanController@listFiles');
            Route::resource('/svg/viewer', 'FloorplanSVGController', [
                'only' => ['show', 'store'],
                'parameters' => ['viewer' => 'floorplan']
            ]);
        });

        //TODO: remove after review
        Route::any('builder-lot', 'DrawerController@getBuilderLot');
    });

    Route::group(['middleware' => ['sitings.check.user:sitingsBuilder']], function () {
        Route::get('drawer/reference-plan/{referencePlan}', 'ReferencePlanController@show')->name('export-doc');
        Route::get('drawer/engineering-plan/{engineeringPlan}', 'EngineeringPlanController@show')->name('export-doc-engineering');
    });

    Route::group(['middleware' => 'sitings.check.user:sitingsBuilder,contractor'], function () {
        Route::view('/drawer/{siting}/export', 'sitings.app.index')
            ->name('siting.export');
        Route::view('/drawer/{siting}/houses', 'sitings.app.index')
            ->name('siting.houses');
        Route::view('/{requestedUri}', 'sitings.app.index')
            ->where('requestedUri', '.*');
    });
});