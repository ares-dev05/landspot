<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Defaults
    |--------------------------------------------------------------------------
    |
    | This option controls the default authentication "guard" and password
    | reset options for your application. You may change these defaults
    | as required, but they're a perfect start for most applications.
    |
    */

    'defaults' => [
        'guard' => 'web',
        'passwords' => 'users',
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication Guards
    |--------------------------------------------------------------------------
    |
    | Next, you may define every authentication guard for your application.
    | Of course, a great default configuration has been defined for you
    | here which uses session storage and the Eloquent user provider.
    |
    | All authentication drivers have a user provider. This defines how the
    | users are actually retrieved out of your database or other storage
    | mechanisms used by this application to persist your user's data.
    |
    | Supported: "session", "token"
    |
    */

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],

        'globalAdmin' => [
            'driver' => 'session',
            'provider' => 'globalAdmins',
        ],

        'builderAdmin' => [
            'driver' => 'session',
            'provider' => 'builderAdmins',
        ],

        'api' => [
            'driver' => 'passport',
            'provider' => 'users',
        ],

        'landDeveloper' => [
            'driver' => 'session',
            'provider' => 'landDevelopers',
        ],

        'builder' => [
            'driver' => 'session',
            'provider' => 'builders',
        ],

        'estateManager' => [
            'driver' => 'session',
            'provider' => 'estateManagers',
        ],

        'globalEstateManager' => [
            'driver' => 'session',
            'provider' => 'globalEstateManagers',
        ],

        'invitedUser' => [
            'driver' => 'session',
            'provider' => 'invitedUsers',
        ],

        'sitingsBuilder' => [
            'driver' => 'session',
            'provider' => 'sitingsBuilders',
        ],

        'contractor' => [
            'driver' => 'session',
            'provider' => 'contractors',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | User Providers
    |--------------------------------------------------------------------------
    |
    | All authentication drivers have a user provider. This defines how the
    | users are actually retrieved out of your database or other storage
    | mechanisms used by this application to persist your user's data.
    |
    | If you have multiple user tables or models you may configure multiple
    | sources which represent each model / table. These sources may then
    | be assigned to any extra authentication guards you have defined.
    |
    | Supported: "database", "eloquent"
    |
    */

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => App\Models\User::class,
        ],

        'landDevelopers' => [
            'driver' => 'eloquent',
            'model' => App\Models\LandDeveloper::class,
        ],

        'builders' => [
            'driver' => 'eloquent',
            'model' => App\Models\Builder::class,
        ],

        'estateManagers' => [
            'driver' => 'eloquent',
            'model' => App\Models\EstateManager::class,
        ],

        'globalEstateManagers' => [
            'driver' => 'eloquent',
            'model' => App\Models\GlobalEstateManager::class,
        ],

        'globalAdmins' => [
            'driver' => 'eloquent',
            'model' => App\Models\GlobalAdmin::class,
        ],

        'builderAdmins' => [
            'driver' => 'eloquent',
            'model' => App\Models\BuilderAdmin::class,
        ],

        'invitedUsers' => [
            'driver' => 'eloquent',
            'model' => App\Models\InvitedUser::class,
        ],

        'contractors' => [
            'driver' => 'eloquent',
            'model' => App\Models\Sitings\Contractor::class,
        ],

        'sitingsBuilders' => [
            'driver' => 'eloquent',
            'model' => App\Models\Sitings\Builder::class,
        ],

        // 'users' => [
        //     'driver' => 'database',
        //     'table' => 'users',
        // ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Resetting Passwords
    |--------------------------------------------------------------------------
    |
    | You may specify multiple password reset configurations if you have more
    | than one user table or model in the application and you want to have
    | separate password reset settings based on the specific user types.
    |
    | The expire time is the number of minutes that the reset token should be
    | considered valid. This security feature keeps tokens short-lived so
    | they have less time to be guessed. You may change this as needed.
    |
    */

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => 'password_resets',
            'expire' => 60,
        ],

        'landDevelopers' => [
            'provider' => 'landDevelopers',
            'table' => 'password_resets',
            'expire' => 60,
        ],

        'builders' => [
            'provider' => 'builders',
            'table' => 'password_resets',
            'expire' => 60,
        ],

        'estateManagers' => [
            'provider' => 'estateManagers',
            'table' => 'password_resets',
            'expire' => 60,
        ],

        'globalEstateManagers' => [
            'provider' => 'globalEstateManagers',
            'table' => 'password_resets',
            'expire' => 60,
        ],

        'globalAdmins' => [
            'provider' => 'globalAdmins',
            'table' => 'password_resets',
            'expire' => 60,
        ],

        'invitedUsers' => [
            'provider' => 'invitedUsers',
            'table' => 'password_resets',
            'expire' => 60,
        ],
    ],

];
