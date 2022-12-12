<?php

namespace App\Console;

use App\Jobs\{CleanExpiredDataJob,
    CountOfInvitedUsersPerDay,
    DeleteUnfinishedSitingsJob,
    DisableUserJob,
    FollowUpMails,
    SendEmailStagesWithoutDocsJob,
    SendLotsWithoutPackagesNotificationEmailToBuilderAdminJob,
    SendLotsWithoutPackagesNotificationEmailToPDFManagerJob,
    SendNotificationToRemindEstateManagersToUpdatePriceListJob,
    SendPackagesUploadedToEstateNotificationJob,
    SendUnreadMessagesNotificationEmailJob};
use App\Models\GlobalSiteSettings;
use Illuminate\Support\Facades\App;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Symfony\Component\Console\Input\ArgvInput;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        //
    ];

    /**
     * Define the application's command schedule.
     *
     * @param \Illuminate\Console\Scheduling\Schedule $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        if (App::environment('production')) {
            $schedule->job(new CountOfInvitedUsersPerDay)
                ->dailyAt('23:00')
                ->withoutOverlapping()
                ->onOneServer();

            $schedule->command('sitemap:generate')
                ->daily()
                ->runInBackground();
        }
        //if artisan have been called with 'schedule:run' exit then do nothing
        if ($this->app->runningInConsole()) {
            $input = new ArgvInput();
            $artisanArg = $input->getFirstArgument();
            if ($artisanArg && strpos($artisanArg, 'schedule:') !== 0) {
                return;
            }
        }

        $schedule->command('command:delete-trashed-ranges')
            ->dailyAt('01:00')
            ->runInBackground()
            ->onOneServer();

        //$schedule->command('command:check-estate-confirmed-accurate')
        //    ->dailyAt('11:00')
        //    ->runInBackground()
        //    ->onOneServer();

        $schedule->job(new DeleteUnfinishedSitingsJob)
            ->dailyAt('01:00')
            ->withoutOverlapping()
            ->onOneServer();

        $schedule->job(new FollowUpMails)
            ->hourly()
            ->withoutOverlapping()
            ->onOneServer();

        if (!GlobalSiteSettings
            ::byType(GlobalSiteSettings::settingsJobEmailNotifications)
            ->firstOrFail()
            ->value) {
            logger()->info('Email jobs are disabled');

            return;
        }

//        $schedule->job(new SendEmailStagesWithoutDocsJob)
//            ->days(0, 2, 4, 6)
//            ->dailyAt('9:00')
//            ->withoutOverlapping()
//            ->onOneServer();

//        $schedule->job(new SendUnreadMessagesNotificationEmailJob)
//            ->hourlyAt(10)
//            ->withoutOverlapping()
//            ->onOneServer();

//        $schedule->job(new SendNotificationToRemindEstateManagersToUpdatePriceListJob)
//            ->days(2, 6)
//            ->at('11:30')
//            ->withoutOverlapping()
//            ->onOneServer();

        $schedule->job(new SendPackagesUploadedToEstateNotificationJob)
            ->dailyAt('23:50')
            ->withoutOverlapping()
            ->onOneServer();

        // $schedule->job(new SendLotsWithoutPackagesNotificationEmailToBuilderAdminJob)
            // ->weeklyOn(3, '10:30')
            // ->withoutOverlapping()
            // ->onOneServer();

        // $schedule->job(new SendLotsWithoutPackagesNotificationEmailToPDFManagerJob)
            // ->weeklyOn(3, '10:30')
            // ->withoutOverlapping()
            // ->onOneServer();

        $schedule->job(new CleanExpiredDataJob)
            ->dailyAt('23:00')
            ->withoutOverlapping()
            ->onOneServer();

        $schedule->job(new DisableUserJob)
            ->dailyAt('00:00')
            ->withoutOverlapping()
            ->onOneServer();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
