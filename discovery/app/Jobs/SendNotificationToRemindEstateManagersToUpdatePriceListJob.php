<?php

namespace App\Jobs;

use App\Models\{Company, Estate, EstateManager};
use Carbon\Carbon;
use Illuminate\Database\Eloquent\{Builder as EloquentBuilder, Collection};
use Illuminate\Mail\Message;

class SendNotificationToRemindEstateManagersToUpdatePriceListJob extends LandspotJob
{

    protected $subject = null;
    protected $view = null;

    function __construct()
    {
        if ((new Carbon)->dayOfWeek === 2) {
            $this->subject = 'Landspot - Is your pricelist on Landspot up to date after the weekend?';
            $this->view = 'emails.reminder-estate-managers-to-update-price-list';
        } else {
            $this->view = 'emails.remind-estate-managers-to-update-price-list';
        }
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        Company::developerCompany()->each(function (Company $company) {
            $this->notifyAdmins($company);
            $this->notifyManagers($company);
        });
    }

    /**
     * @param Company $company
     */
    protected function notifyManagers(Company $company)
    {
        /** @var Collection $estateManagers */
        $estateManagers = EstateManager::byCompany($company->id)
            ->where('is_global_estate_manager', 0)
            ->whereHas('estate')
            ->hasEnabledEmailNotifications()
            ->get();

        $estateManagers->each(function (EstateManager $estateManager) {
            $estates = $estateManager
                ->estate()
                ->get(['manager_id', 'state_id', 'name', \DB::raw('estates.id')])
                ->filter(function (Estate $estate) {
                    return $estate->stage->isNotEmpty();
                });

            if ($estates->isEmpty()) return;
            $statesIds        = $estates->pluck('state_id')->unique();
            $builderCompanies = Company::builderCompaniesInState($statesIds)
                ->hasEstatesAccess()
                ->get(['id', 'name']);

            $this->sendEmail(collect([$estateManager]), $builderCompanies);
        });
    }

    /**
     * @param Company $company
     */
    protected function notifyAdmins(Company $company)
    {
        $admins = $company
            ->user()
            ->where(function (EloquentBuilder $b) {
                $b->developerAdmin('or');
                $b->globalEstateManager('or');
            })
            ->hasEnabledEmailNotifications()
            ->get(['id', 'display_name', 'email']);

        /** @var Collection $estates */
        $estates   = $company->estate()->get(['state_id']);
        $statesIds = $estates->pluck('state_id')->unique();

        $builderCompanies = Company::builderCompaniesInState($statesIds)
            ->hasEstatesAccess()
            ->get(['id', 'name']);

        $this->sendEmail($admins, $builderCompanies);
    }

    /**
     * @param Collection|\Illuminate\Support\Collection $users
     * @param Collection $builderCompanies
     */
    protected function sendEmail($users, Collection $builderCompanies)
    {
        foreach ($users as $user) {
            $companyName = ($builderCompanies->isNotEmpty()) ? $builderCompanies->random()->name : 'Builder';
            $subject = $this->subject ?? "{$companyName} is looking at your Land List on Landspot. Is it up to date?";

            self::email(
                $this->view,
                compact('user', 'uploadedPackages'),
                function (Message $msg) use ($companyName, $user, $subject) {
                    $msg->from(config('mail.from.address'), config('mail.from.name'))
                        ->subject($subject);

                    $msg->to($user->email, $user->display_name);
                    static::appendJobsBCCEmail($msg);
                }
            );
        }
    }
}
