<?php

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

Route::domain(config('app.LOTMIX_URL'))
    ->group(function () {

        //region
        //TODO: deprecated

//        Route::get('login', 'Lotmix\Auth\LoginController@showLoginForm')->middleware('slash:add')->name('lotmix-login');
//        Route::post('login', 'Lotmix\Auth\LoginController@login');
//
//        Route::get('password/reset', 'Lotmix\Auth\ForgotPasswordController@showLinkRequestForm')->name('password.request');
//        Route::post('password/email', 'Lotmix\Auth\ForgotPasswordController@sendResetLinkEmail')->name('password.email');
//        Route::get('password/reset/{token}', 'Lotmix\Auth\ResetPasswordController@showResetForm')->name('password.reset');
//        Route::post('password/reset', 'Lotmix\Auth\ResetPasswordController@reset');
//
//        Route::get('logout/{nonce}', 'Lotmix\Auth\LoginController@logout')->name('logout');
//
//        Route::get('register-invite/{token}', 'Lotmix\Auth\RegisterController@showRegistrationForm')
//            ->name('register-invite')
//            ->middleware('check.invitation.token');
//        Route::post('register-invite/{token}', 'Lotmix\Auth\RegisterController@register')
//            ->middleware('check.invitation.token');
//
//        Route::group(['middleware' => ['check.ajax']], function () {
//            Route::put('profile/{user}/change/password', 'Lotmix\ProfileController@changePassword')->name('changePassword');
//            Route::post('my-shortlist', 'Lotmix\LotmixController@getClientShortlist')->middleware('check.ajax');
//            Route::get('home', 'Lotmix\LotmixController@index')->name('my-lotmix');
//            Route::get('home/company/{company}', 'Lotmix\LotmixController@getCompany');
//            Route::post('home/estate/{estate}', 'Lotmix\EstatesController@getUserEstate');
//            Route::get('home/estate/{estate}/my-documents', 'Lotmix\LotmixController@getDocumentsByEstate');
//            Route::get('home/toggle-lot-shortlist/{lot}', 'Lotmix\LotmixController@toggleShortlistLot');
//            Route::post('home/toggle-house-shortlist/{house}', 'Lotmix\LotmixController@toggleShortlistHouse');
//
//            Route::resource('profile', 'Lotmix\ProfileController', [
//                'parameters' => [
//                    'profile' => 'user'
//                ],
//                'only' => ['index', 'show', 'update']
//            ]);
//
//            Route::get('landspot/view-packages/{estate}', 'Lotmix\EstatesController@estateLotPackages');
//            Route::get('lotmix-notification', 'Lotmix\LotmixNotificationController@unreadedNotification');
//            Route::post('lotmix-notification/{invitedUserNotification}', 'Lotmix\LotmixNotificationController@closeNotification');
//            Route::resource(
//                'landspot/estate-package',
//                'Lotmix\EstatePackageController',
//                [
//                    'only' => ['index'],
//                    'parameters' => ['estate-package' => 'object']
//                ]
//            );
//        });
        //endregion

        Route::prefix('enquire')->group(function () {
            Route::view('/steps', 'lotmix.enquire-once.index', ['title' => 'Lotmix - Enquire Once'])->middleware('slash:add')->name('enquire');
            Route::view('/', 'lotmix.enquire-once.index', ['title' => 'Lotmix - Enquire Once'])->middleware('slash:add')->name('enquire');

            Route::get('builders', 'Lotmix\EnquireController@getBuilders');
            Route::get('regions', 'Lotmix\EnquireController@getRegions');
            Route::get('suburbs/{region}', 'Lotmix\EnquireController@getSuburbs');
            Route::get('states', 'Lotmix\EnquireController@getStates');
            Route::get('buyer-types', 'Lotmix\EnquireController@getBuyerTypes');

            Route::view('submission', 'lotmix.enquire-once.success');
            Route::prefix('message')->group(function () {
                Route::post('companies', 'Lotmix\EnquireController@companiesEnquireMessage');
                Route::post('companies/{company}', 'Lotmix\EnquireController@companyEnquireMessage');
                Route::post('estates/{estate}', 'Lotmix\EnquireController@estateEnquireMessage');
            });
            Route::post('sms-verification', 'Lotmix\EnquireController@sendSMSVerification');
            Route::post('verify-sms-code', 'Lotmix\EnquireController@verifySMSCode');
        });


        Route::any('/', 'Lotmix\LotmixController@index')->middleware('web')->name('homepage');

        Route::post('amazon-sns/notifications', 'AmazonController@handleBounceOrComplaint');

        Route::get('/unsubscribe/{hash}', 'Lotmix\LotmixController@showUnsubscribe')->name('unsubscribe');
        Route::post('/unsubscribe/{hash}', 'Lotmix\LotmixController@unsubscribe');

        Route::get('my-document/{document}', 'Lotmix\LotmixController@previewFile');

        Route::view('/tos', 'lotmix.tos')->name('lotmix-tos');
        // Route::view('/privacy-policy', 'lotmix.privacy-policy')->name('lotmix-privacy-policy');

        Route::group(['middleware' => ['web', 'slash:add']], function () {
            Route::get('public-estates/{abbrev}', 'Lotmix\EstatesController@getPublicEstates');

            Route::middleware('slash:add')->group(function () {

                Route::prefix('land-estates')->group(function () {
                    Route::get('{abbrev}/{suburb?}', 'Lotmix\EstatesController@getEstateLocator')->name('estate-locator');
                    Route::get('{state}/{suburb}/{estateSlug}', 'Lotmix\EstatesController@getPublicEstatePage')->name('public-estate-page');
                    Route::post('estate-autocomplete', 'Lotmix\EstatesController@getAutocompleteEstate')->name('autocomplete-estate');
                });

                Route::view('/sunpather/{form?}', 'lotmix.sunpather.index')->name('sunpather');
            });
        });

        Route::group(['middleware' => ['slash:add', 'check.ajax']], function () {

            Route::prefix('floorplans')->group(function () {
                Route::any('filter', 'Lotmix\DiscoveryController@filter');
                Route::view('homebuilder/{slug}', 'lotmix.user.spa')->middleware('check.lotmix.route:company');
                Route::get('homebuilder/{slug}/filter', 'Lotmix\DiscoveryController@filterHouses');
                Route::get('{house}', 'Lotmix\DiscoveryController@show');
                Route::get('print-brochure/{id}', 'DiscoveryController@printBrochure');
            });

            Route::prefix('land-for-sale')->group(function () {
                Route::get('filter-estates', 'Lotmix\EstatesController@filterEstates');
                Route::get('communities/{key}', 'Lotmix\EstatesController@show')->middleware('check.lotmix.route:estate');
            });

            Route::view('/{requestedUri}', 'lotmix.user.spa')
                ->where('requestedUri', '.*');
        });
    });

