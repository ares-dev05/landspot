<?php

use \App\Models\InvitedUser;

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

Route::domain(config('app.url'))->group(function () {
    Route::get('login', 'Auth\LoginController@showLoginForm')->name('login');
    Route::get('{brand}/login', 'Auth\LoginController@showLoginForm')->name('brand.login');
    Route::post('login', 'Auth\LoginController@login');
    Route::get('logout/{nonce}', 'Auth\LoginController@logout')->name('logout');

    //Replace after framework upgrade with Route::resetPassword();
    Route::get('password/reset', 'Auth\ForgotPasswordController@showLinkRequestForm')->name('password.request');
    Route::post('password/email', 'Auth\ForgotPasswordController@sendResetLinkEmail')->name('password.email');
    Route::get('password/reset/{token}', 'Auth\ResetPasswordController@showResetForm')->name('password.reset');
    Route::post('password/reset', 'Auth\ResetPasswordController@reset');

//    Route::get('register', 'Auth\RegisterController@showRegistrationForm')->name('register');
//    Route::post('register', 'Auth\RegisterController@register');

    Route::any('register', function () {
        return redirect()->route('homepage');
    });

    Route::get('login/config', 'Auth\LoginController@getLoginConfig');
    Route::post('login/login2FA', 'Auth\LoginController@login2FA')->name('auth.login-2fa');
    Route::post('login/sendSMS', 'Auth\LoginController@sendSMSForLogin');

    Route::get('reset/password', 'UserController@resetInvitationPassword')->name('reset.invitation.password');
    Route::post('reset/password', 'UserController@reset')->name('reset.password');
    Route::post('membership', 'UserController@membership')->name('membership');
    Route::get('auth/verify/{token}', 'UserController@verifyEmail');

    Route::view('/', 'landspot.homepage')->name('homepage');

    Route::middleware('slash:add')->group(function () {
        Route::view('terms-of-use', 'landspot.tos')->name('terms-of-use');
        // Route::view('privacy-policy', 'landspot.privacy-policy')->name('privacy-policy');
    });

    Route::get('auth/callback', 'Auth\LoginController@oauthLoginCallback')->name('oauth-login-callback');

    Route::middleware(['check.user:builder,builderAdmin', 'can:discovery'])->group(function () {
        Route::get('manager', 'DiscoveryManagerController@index')->name('manager');
        Route::get('manager/get-houses', 'DiscoveryManagerController@getHouses');

        Route::post('manager/set-company-data', 'DiscoveryManagerController@setCompanyData');
        Route::post('manager/company/upload-image', 'DiscoveryManagerController@uploadImage');

        Route::post('manager/add-house', 'DiscoveryManagerController@addHouse');
        Route::post('manager/discovery-house/{house}', 'DiscoveryManagerController@updateDiscoveryHouse');

        Route::get('manager/get-details/{house}', 'DiscoveryManagerController@getDetails');
        Route::post('manager/edit-details/{houseAttributes}', 'DiscoveryManagerController@editHouseDetails');

        Route::delete('manager/delete-range/{deletedRange}', 'DiscoveryManagerController@deleteRange');
        Route::delete('manager/delete-house/{house}', 'DiscoveryManagerController@deleteHouse');

        Route::post('manager/get-house-media/{house}', 'DiscoveryManagerController@getHouseMedia');
        Route::post('manager/update-house-media/{house}', 'DiscoveryManagerController@updateHouseMedia');

        Route::delete('manager/delete/{name}/{id}', 'DiscoveryManagerController@deleteEntity')
            ->where('name', '(options|floorplans|facades|gallery)');

        Route::post('builder/upload-xml', 'DiscoveryManagerController@uploadXML');
        Route::post('manager/save-range-inclusions', 'DiscoveryManagerController@saveRangeInclusions');


        Route::view('discovery', 'landspot.discovery')->name('discovery');
        Route::view('footprints', 'landspot.discovery')->name('footprints');

        Route::any('{discoveryMode}/filter', 'DiscoveryController@filter')
            ->where('discoveryMode', '(discovery|footprints)');

        Route::view('{discoveryMode}/{name}/{house}', 'landspot.discovery')
            ->where([
                'discoveryMode' => '(discovery|footprints)',
                'name' => '(volume|overview|floorplan|available-options|gallery)'
            ]);

        Route::get('{discoveryMode}/{house}', 'DiscoveryController@show')
            ->where('discoveryMode', '(discovery|footprints)');
    });

    Route::middleware(['check.user:builder,builderAdmin,landDeveloper,estateManager,globalEstateManager', 'can:estates-access'])->group(function () {
        Route::view('landspot/my-estates', 'user.spa', ['rootID' => 'landspot-estates', 'googleMap' => true])
            ->name('landspot.my-estates');
        Route::get('landspot/filter-estates', 'EstatesController@filterEstates');

        Route::get('landspot/estate/{key}', 'EstatesController@show');
        Route::put('landspot/estate/{estate}/estate-description', 'EstatesController@updateDescription');
        Route::post('landspot/estate/{estate}/add-amenity', 'EstatesController@addAmenity');
        Route::post('landspot/estate/{estate}/update-snapshots', 'EstatesController@updateSnapshots');
        Route::post('landspot/estate/{estate}/update-answers', 'EstatesController@updateAnswers');
        Route::post('landspot/estate/{estate}/estate-gallery', 'EstatesController@uploadEstateImages');
        Route::delete('landspot/estate/{estate}/estate-gallery/{estateImage}', 'EstatesController@deleteEstateImage');
        Route::resource('landspot/lot-package', 'LotPackageController',
            [
                'only' => ['index', 'store', 'update', 'destroy'],
                'parameters' => ['lot-package' => 'id']
            ]
        );

        Route::resource('landspot/estate-package', 'EstatePackageController',
            [
                'only' => ['index', 'store', 'destroy'],
                'parameters' => ['estate-package' => 'object']
            ]
        );
        Route::get('landspot/pdf-lot-package/{package}', 'LotPackageController@previewPDF');
        Route::get('landspot/pdf-stage-package/{stageDoc}', 'EstatePackageController@previewFile')
            ->name('landspot.export-stage-doc');
        Route::any('landspot/export-stage', 'LotPDFTemplateController@exportLots')->name('landspot.export-stage');

        Route::group(['middleware' => 'can:chat'], function () {
            Route::get('live-chat/list-user-object-contacts', 'ChatController@listUserContactsInObject');
            Route::get('live-chat/list-user-directory', 'ChatController@listUserDirectory');
            Route::get('live-chat/list-contacts-book', 'ChatController@listContactsBook');
            Route::get('live-chat/list-recent-channels', 'ChatController@getRecentChats');
            Route::post('live-chat/channel-history', 'ChatController@getChannelHistory');
            Route::put('live-chat/channel-read/{channel}', 'ChatController@updateChannel');
            Route::resource('live-chat', 'ChatController', ['parameters' => ['live-chat' => 'channel']]);
        });

        Route::group([
            'prefix' => 'landspot/api/lot-drawer',
            'middleware' => ['check.ajax']
        ], function () {
            Route::get('/load-dialog-data/{lot}', 'LotDrawerController@getDialogData');
        });
    });

    Route::middleware(['check.user:builder,builderAdmin,landDeveloper,estateManager,globalEstateManager'])->group(function () {
        Route::get('{discoveryMode}/print-brochure/{id}', 'DiscoveryController@printBrochure')
            ->where('discoveryMode', '(discovery|footprints)');
        Route::post('upload-image', 'LandSpotController@uploadImage')->name('upload-image');
        Route::resource('landspot/support-notification', 'SupportNotificationController',
            [
                'only' => ['update'],
                'parameters' => ['support-notification' => 'user']
            ]
        );

        Route::resource('landspot/notification', 'UserNotificationController',
            [
                'only' => ['index'],
                'parameters' => ['notification' => 'user']
            ]
        );
        Route::post('landspot/notification/{userNotification}', 'UserNotificationController@closeNotification');
        Route::post('landspot/browser-notification-channels', 'UserNotificationController@getBrowserNotificationChannels');
    });

    Route::middleware('check.user:landDeveloper,estateManager,globalEstateManager')->group(function () {

        Route::get('landspot/view-packages/{estate}', 'LotPackageController@showLotPackages');
        Route::post('landspot/move-column', 'LandSpotController@moveColumn');
        Route::delete('landspot/remove-column/{attribute}', 'LandSpotController@removeColumn');
        Route::put('landspot/add-column', 'LandSpotController@addNewEstateColumn');
        Route::put('landspot/rename-column/{lotAttributes}', 'LandSpotController@renameEstateColumn');

        Route::put('landspot/update-stage/{stage}', 'LandSpotController@updateStage');
        Route::post('landspot/add-stage/{estate}', 'LandSpotController@addStage');
        Route::delete('landspot/remove-stage/{stage}', 'LandSpotController@removeStage');
        Route::post('landspot/save-price-list/{stage}', 'LandSpotController@savePriceList');

        Route::post('landspot/upload-price-list/{stage}', 'LandSpotController@uploadPriceList');

        Route::view('landspot/discovery', 'user.spa', ['rootID' => 'developer-discovery'])
            ->name('landspot.discovery');
        Route::any('landspot/discovery/company/{companyId}', 'LandDevController@company');
        Route::any('landspot/discovery/filter', 'LandDevController@filter');
        Route::any('landspot/discovery/company/{companyId}/filter', 'LandDevController@filterHouses');
        Route::view('landspot/discovery/{name}/{house}', 'user.spa', ['rootID' => 'developer-discovery'])
            ->where('name', '(volume|overview|floorplan|available-options|gallery)');

        Route::get('landspot/discovery/{house}', 'LandDevController@show');

        Route::post('landspot/pdf-template/upload-image', 'LotPDFTemplateController@uploadParagraphImage');

        Route::put('landspot/lot/bulk-update', 'LotController@bulkUpdate');
        Route::resource('landspot/lot', 'LotController', ['only' => ['store', 'update', 'destroy']]);

        Route::post('landspot/lotmix-lot-visibility/{lot}', 'LotVisibilityController@updateLotmixLotVisibility');

        Route::resource('landspot/visibility/lot', 'LotVisibilityController', ['only' => ['show', 'update']]);

        Route::resource('landspot/pdf-template', 'LotPDFTemplateController', [
            'parameters' => [
                'pdf-template' => 'estate'
            ],
            'only' => ['show', 'update']
        ]);

        Route::resource('landspot/estate', 'EstatesController', [
            'only' => ['update', 'store']
        ]);
    });

    Route::group(['middleware' => ['check.user:builder,builderAdmin,landDeveloper,estateManager,globalEstateManager,globalAdmin']], function () {
        Route::view('landspot/draft-sitings', 'user.spa', ['rootID' => 'my-clients'])->name('draft-sitings');
        Route::view('landspot/old-sitings', 'user.spa', ['rootID' => 'my-clients'])->name('old-sitings');
        Route::get('landspot/legacy-sitings', 'Lotmix\MyClientsController@getLegacySitings');
        Route::get('landspot/my-clients/managers/{invitedUser}', 'Lotmix\MyClientsController@getAvailableManagers');
        Route::get('landspot/my-clients/draft-siting-managers/{siting}', 'Lotmix\MyClientsController@getSitingManagers');
        Route::post('landspot/my-clients/share-draft-siting/{siting}', 'Lotmix\MyClientsController@shareDraftSiting');
        Route::post('landspot/my-clients/share-credentials/{invitedUser}', 'Lotmix\MyClientsController@shareBuyerCredentials');
        Route::post('landspot/my-clients/clone-siting/{siting}', 'Lotmix\MyClientsController@cloneSiting');
        Route::get('landspot/my-clients/import/{siting}', 'Lotmix\MyClientsController@importLegacy');
        Route::group(['middleware' => ['can:manage-my-clients']], function () {
            Route::resource('landspot/my-clients', 'Lotmix\MyClientsController', [
                'parameters' => [
                    'my-clients' => 'invitedUser'
                ],
                'only' => [
                    'index', 'store', 'update', 'destroy'
                ]
            ]);
            Route::bind('invitedUser', function ($id) {
                return InvitedUser::with(['brief', 'brief.companies'])->findOrFail($id);
            });
            Route::get('landspot/short-list/{invitedUser}', 'Lotmix\MyClientsController@getShortList');
            Route::post('landspot/short-list', 'Lotmix\MyClientsController@updateShortList');
            Route::get('landspot/my-client-file/{document}', 'Lotmix\MyClientsController@previewFile');
            Route::post('landspot/my-client-file', 'Lotmix\MyClientsController@uploadFile');
            Route::put('landspot/my-client-files', 'Lotmix\MyClientsController@addDocument');
            Route::get('landspot/my-client-details/{invitedUser}', 'Lotmix\MyClientsController@getMyClientDetails');
            Route::post('landspot/my-client-details', 'Lotmix\MyClientsController@updateMyClientDetails');
            Route::delete('landspot/my-client-sitings/{invitedUser}', 'Lotmix\MyClientsController@deleteMyClientSitings');
            Route::get('landspot/my-sitings', 'Lotmix\MyClientsController@getMySitings');
            Route::delete('landspot/my-sitings/{siting}', 'Lotmix\MyClientsController@deleteMySiting');
            Route::get('landspot/siting-preview-file/{siting}', 'Lotmix\MyClientsController@sitingPreview')->name('siting-preview');
            Route::post('landspot/my-clients/brief/action', 'Lotmix\MyClientsController@briefAction');
            Route::get('landspot/my-clients/brief/download/{brief}', 'Lotmix\MyClientsController@downloadBriefPDF');
        });
    });

    Route::group(['middleware' => ['check.user:builder,builderAdmin,landDeveloper,estateManager,globalEstateManager,globalAdmin', 'can:manage-users']], function () {
        Route::get('landspot/user-manager', 'UserManagerController@userManager')->name('landspot.user-manager');
        Route::resource('landspot/user-manager/user', 'UserManagerController', ['only' => ['index', 'store', 'update', 'destroy']]);
        Route::get('landspot/user-manager/filter', 'UserManagerController@filterUsers');
        Route::get('landspot/user-manager/company/{company}', 'UserManagerController@filterUsers')
            ->middleware('can:view,company')
            ->name('landspot.user-company');


        Route::post('landspot/user-manager/reset-password/{user}', 'UserManagerController@sendResetPasswordLink')
            ->middleware('can:reset-user-password');
        Route::post('landspot/user-manager/reset-user-2fa/{user}', 'UserManagerController@resetUser2FA')
            ->middleware('can:reset-user-2fa');

        Route::get('landspot/user-manager/estates/{user}', 'UserManagerController@getEstatesManagerPermissions');
        Route::post('landspot/user-manager/estates/{user}', 'UserManagerController@saveEstateManagerPermissions');

        Route::get('landspot/user-manager/login/{user}', 'UserManagerController@loginAs');

        Route::post('landspot/user-manager/support-request/{user}', 'UserManagerController@supportRequest');
        Route::post('landspot/user-manager/close-access-request/{user}', 'UserManagerController@closeAccess');

        Route::post('landspot/user-manager/sales-locations/{company}', 'UserManagerController@updateSalesLocations');
        Route::post('landspot/user-manager/lotmix-settings/{company}', 'UserManagerController@updateLotmixStateSettings');
    });

    Route::group(['middleware' => ['check.user:globalAdmin,builder,builderAdmin', 'can:pdf-managers']], function () {
        Route::get('landspot/pdf-manager', 'PdfManagerController@pdfManager')->name('landspot.pdf-manager');
        Route::resource('landspot/pdf-manager/user', 'PdfManagerController', ['only' => ['index', 'update']]);
        Route::get('landspot/pdf-manager/filter', 'PdfManagerController@filterUsers');
        Route::get('landspot/pdf-manager/company/{company}', 'PdfManagerController@filterUsers')->name('landspot.pdf-company')->middleware('can:view,company');

        Route::post('landspot/pdf-manager/users', 'PdfManagerController@store');
    });

    Route::group(['middleware' => ['check.user', 'can:manage-companies']], function () {
        Route::resource('landspot/company', 'CompanyController', ['only' => ['store', 'update', 'show']]);
    });

    Route::group(['middleware' => ['check.user', 'can:feature-notifications']], function () {
        Route::get('landspot/notifications/features/companies', 'FeatureNotificationController@getCompanies');
        Route::get('landspot/notifications', 'FeatureNotificationController@index');
        Route::get('landspot/notifications/features/send/{featureNotification}', 'FeatureNotificationController@send')->name('features-send');

        Route::resource('landspot/notifications/features', 'FeatureNotificationController', [
            'parameters' => [
                'features' => 'featureNotification'
            ]
        ]);
        Route::get('landspot/notifications/lotmix-notification/send/{lotmixNotification}', 'Lotmix\LotmixNotificationController@send');
        Route::resource('landspot/notifications/lotmix-notification', 'Lotmix\LotmixNotificationController');
        Route::resource('landspot/notifications/media-file', 'NotificationMediaController',
            [
                'only' => ['index', 'show', 'create', 'store', 'destroy'],
                'parameters' => ['media-file' => 'notificationMedia']
            ]
        );
    });

    Route::group(['middleware' => ['check.user:builder,builderAdmin,landDeveloper,estateManager,globalEstateManager,globalAdmin']], function () {
//        Route::put('profile/phone', 'UserProfileController@changePhone');
        Route::put('profile/tos', 'UserProfileController@acceptTOS');
        Route::post('profile/authorizeAccess', 'UserProfileController@authorizeUser');

        Route::get('profile/2FA', 'UserProfileController@get2FAKey');
        Route::post('profile/2FA', 'UserProfileController@verifyOTP');

        Route::resource('profile', 'UserProfileController', [
            'parameters' => [
                'profile' => 'user'
            ],
            'only' => ['index'/*, 'update'*/]
        ]);

        Route::put('profile/{user}/change/password', 'UserProfileController@changePassword')->name('changePassword');
    });

    Route::group(['middleware' => ['check.user:globalAdmin']], function () {
        Route::view('kaspa-engine/guideline-profiles', 'user.spa', ['rootID' => 'kaspa-engine'])->name('guideline-profiles');
        Route::get('kaspa-engine/guideline-profiles/section-mode/stage/{id}', 'KaspaEngineController@index')
            ->name('selection-guideline');
        Route::put('kaspa-engine/guideline-profiles/section-mode/stage/{id}', 'KaspaEngineController@store');
        Route::delete('kaspa-engine/guideline-profiles/section-mode/stage/{id}', 'KaspaEngineController@destroy');
        Route::get('kaspa-engine/estates', 'KaspaEngineController@filterEstates');
        Route::view('kaspa-engine/formula-library', 'user.spa', ['rootID' => 'kaspa-engine'])->name('formula-library');
        Route::get('kaspa-engine/formulas', 'KaspaEngineController@filterFormulas');
        Route::post('kaspa-engine/store-pdf', 'KaspaEngineController@storeStagePdf');
        Route::delete('kaspa-engine/destroy-pdf', 'KaspaEngineController@destroyStagePdf');
        Route::resource('landspot/site-settings', 'SiteAdminController', ['only' => ['index', 'store']]);
        Route::resource('landspot/admin/developers-features', 'AdminDeveloperFeaturesController', ['only' => ['index', 'update']]);
        Route::get('landspot/admin/developers-features/{companyId}', 'AdminDeveloperFeaturesController@index');
    });

    Route::group(['middleware' => ['check.user:builder,builderAdmin', 'can:nearmap-admin']], function() {
        Route::resource('landspot/nearmap-settings', 'NearmapAdminController', ['only' => ['index', 'store']]);
    });

    Route::group(['middleware' => ['check.user:builderAdmin,globalAdmin']], function () {
        Route::view('kaspa-engine/package-settings', 'user.spa', ['rootID' => 'kaspa-engine'])->name('kaspa.package-settings');
        Route::view('kaspa-engine/site-costs', 'user.spa', ['rootID' => 'kaspa-engine'])->name('kaspa.site-costs');
        Route::view('kaspa-engine/my-estates', 'user.spa', ['rootID' => 'kaspa-engine'])->name('kaspa.my-estates');
    });

    Route::group(['middleware' => ['check.user:landDeveloper,estateManager,globalEstateManager']], function () {
        Route::view('landspot/lot-drawer/{estate}/{requestedUri}', 'lot-drawer.index')
            ->where('requestedUri', '.*')->middleware('lot.drawer');

        Route::group([
            'prefix' => 'landspot/api/lot-drawer',
            'middleware' => ['check.ajax']
        ], function () {
            Route::get('/{estate}', 'LotDrawerController@getEstateData');
            Route::get('/load-pos/{lot}', 'LotDrawerController@getStagePos');
            Route::get('/load-lot-data/{lot}', 'LotDrawerController@getLotDrawerData');
            Route::get('/load-lot-settings/{lot}', 'LotDrawerController@getLotSettings');
            Route::post('/save-lot-data/{lot}', 'LotDrawerController@saveLotDrawerData');
        });
    });
});

Route::post('error-handler', 'ErrorHandlerController@catchError');