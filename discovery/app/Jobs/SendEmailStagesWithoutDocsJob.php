<?php

namespace App\Jobs;

use App\Models\{Company, Estate, EstateManager};
use Illuminate\Database\Eloquent\{Builder, Collection, Relations\HasMany};
use Illuminate\Mail\Message;

class SendEmailStagesWithoutDocsJob extends LandspotJob
{
    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $companies = [];
        Estate::approved()
            ->whereDoesntHave('stage.stageDocs')
            ->chunk(10, function (Collection $estates) use (&$companies) {
                foreach ($estates as $estate) {
                    if (!array_key_exists($estate->company_id, $companies)) {
                        $companies[$estate->company_id] = [];
                    }
                    $companies[$estate->company_id][] = $estate->id;
                }
            });
        foreach ($companies as $companyID => $estateIds) {
            /** @var Company $company */
            $company = Company::developerCompany()->find($companyID);
            if (!$company || !$estateIds) continue;

            static::notifyAdmins($company, $estateIds);
            static::notifyManagers($company, $estateIds);
        }
    }

    protected static function notifyAdmins(Company $company, array $estateIds)
    {
        $admins = $company
            ->user()
            ->hasEnabledEmailNotifications()
            ->where(function ($b) {
                $b->developerAdmin('or');
                $b->globalEstateManager('or');
            })
            ->get(['id', 'display_name', 'email']);

        /** @var Collection $estates */
        $estates = Estate
            ::whereIn('id', $estateIds)
            ->with([
                'stage' => function (HasMany $b) {
                    $b->whereDoesntHave('stageDocs');
                }
            ])
            ->get(['id', 'name', 'state_id']);

        $statesIds = $estates->pluck('state_id')->unique();

        $builderCompanies = Company::builderCompaniesInState($statesIds)
            ->hasEstatesAccess()
            ->get(['id', 'name']);

        static::sendEmail($admins, $builderCompanies, $estates);
    }

    protected static function notifyManagers($company, array $estateIds)
    {
        /** @var Collection $estateManagers */
        $estateManagers = EstateManager
            ::byCompany($company->id)
            ->hasEnabledEmailNotifications()
            ->whereHas(
                'estate',
                function (Builder $b) use ($estateIds) {
                    $b->whereIn('estate_id', $estateIds);
                }
            )->get();

        $estateManagers->each(function (EstateManager $estateManager) {
            $estates = $estateManager
                ->estate()
                ->with([
                    'stage' => function (HasMany $b) {
                        $b->whereDoesntHave('stageDocs');
                    }
                ])
                ->get(['manager_id', 'state_id', 'name', \DB::raw('estates.id')])
                ->filter(function (Estate $estate) {
                    return $estate->stage->isNotEmpty();
                });
            if ($estates->isEmpty()) return;
            $statesIds        = $estates->pluck('state_id')->unique();
            $builderCompanies = Company::builderCompaniesInState($statesIds)
                ->hasEstatesAccess()
                ->get(['id', 'name']);

            static::sendEmail(collect([$estateManager]), $builderCompanies, $estates);
        });
    }

    /**
     * @param Collection|\Illuminate\Support\Collection $users
     * @param Collection $builderCompanies
     * @param Collection $estates
     */
    protected static function sendEmail($users, Collection $builderCompanies, Collection $estates)
    {
        foreach ($users as $user) {
            $companyName = ($builderCompanies->isNotEmpty()) ? $builderCompanies->random()->name : 'Builder';

            self::email(
                'emails.stages-without-packages',
                compact('estates', 'companyName'),
                function (Message $msg) use ($companyName, $user) {
                    static::appendJobsBCCEmail($msg);
                    $msg->from(config('mail.from.address'), config('mail.from.name'))
                        ->subject("${companyName} Users are looking for you Estate Documentation. Itʼs missing!");

                    $msg->to($user->email, $user->display_name);
                }
            );
        }
    }
}
