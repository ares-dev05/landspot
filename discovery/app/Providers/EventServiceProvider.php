<?php

namespace App\Providers;

use Illuminate\Mail\Events\MessageSending;
use App\Events\{
    LandspotUserRegistered,
    TwoFAStateChanged,
    PhoneChanged,
    EstateCreated,
    EstateApproved,
    PasswordChanged,
    EstateUpdated
};
use App\Listeners\{CheckEmailPreferences,
    ResetUnreadMessageNotification,
    SendRegisteredUserNotification,
    SendTwoFAStateNotification,
    SendPhoneChangedNotification,
    SendAdminEstateNotification,
    SendEstateApprovedNotification,
    SendPasswordChangedNotification,
    EstateUpdatedListener,
    UserLoggedOut
};

use Illuminate\Auth\Events\{Login, Logout};

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        EstateCreated::class => [
            SendAdminEstateNotification::class,
        ],
        EstateApproved::class => [
            SendEstateApprovedNotification::class,
        ],
        PasswordChanged::class => [
            SendPasswordChangedNotification::class,
        ],
        EstateUpdated::class => [
            EstateUpdatedListener::class,
        ],
        Logout::class => [
            UserLoggedOut::class,
        ],
        PhoneChanged::class => [
            SendPhoneChangedNotification::class,
        ],
        TwoFAStateChanged::class => [
            SendTwoFAStateNotification::class,
        ],
        LandspotUserRegistered::class => [
            SendRegisteredUserNotification::class
        ],
        Login::class => [
            ResetUnreadMessageNotification::class
        ],
        MessageSending::class => [
            CheckEmailPreferences::class
        ]
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        parent::boot();

    }
}
