<?php

namespace App\Jobs;

use App\Models\{
    Company, EstateManager, LandDeveloper
};
use Illuminate\Database\Eloquent\{
    Builder as EloquentBuilder, Collection, Relations\HasMany, Relations\HasManyThrough, Relations\BelongsToMany
};
use Illuminate\Mail\Message;
use Illuminate\Support\Str;

class SendPackagesUploadedToEstateNotificationJob extends LandspotJob
{
    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        Company::whereHas('estate.stage.lots.lotPackage', function (EloquentBuilder $b) {
            $b->forPastDay();
        })->chunk(10, function ($companies) use (&$companyEstates) {
            $companies->each(function (Company $company) {
                static::notifyAdmins($company);
                static::notifyManagers($company);
            });
        });
    }

    /**
     * @param BelongsToMany|HasMany $b
     * @return EloquentBuilder
     */
    protected static function estateQb($b)
    {
        return $b->whereHas('stage.lots.lotPackage', function (EloquentBuilder $b) {
            $b->forPastDay();
        })->withCount(['estateLots as lots_count' => function (EloquentBuilder $b) {
            $b->whereHas('lotPackage', function (EloquentBuilder $b) {
                $b->forPastDay();
            });
        }])->with(['estateLots' => function (HasManyThrough $b) {
            $b->whereHas('lotPackage', function (EloquentBuilder $b) {
                $b->forPastDay();
            })->withCount(['lotPackage' => function (EloquentBuilder $b) {
                $b->forPastDay();
            }]);
        }]);
    }

    /**
     * @param Company $company
     */
    protected static function notifyManagers(Company $company)
    {
        /** @var Collection $estateManagers */
        $estateManagers = EstateManager
            ::byCompany($company->id)
            ->whereHas('estate.stage.lots.lotPackage', function (EloquentBuilder $b) {
                $b->forPastDay();
            })
            ->with(['estate' => function (BelongsToMany $b) {
                return static::estateQb($b);
            }])
            ->where(function (EloquentBuilder $b) {
                $b->where('is_global_estate_manager', 0)
                    ->whereDoesntHave('group', function (EloquentBuilder $b) {
                        $b->developerAdmins();
                    });
            })
            ->hasEnabledEmailNotifications()
            ->get();

        $estateManagers->each(function (EstateManager $estateManager) {
            static::sendEmail(collect([$estateManager]));
        });
    }

    /**
     * @param Company $company
     */
    protected static function notifyAdmins(Company $company)
    {
        $admins = LandDeveloper
            ::byCompany($company->id)
            ->where(function (EloquentBuilder $b) {
                $b->developerAdmin('or');
                $b->globalEstateManager('or');
            })
            ->with(['estate' => function (HasMany $b) {
                return static::estateQb($b);
            }])
            ->hasEnabledEmailNotifications()
            ->get(['id', 'display_name', 'email', 'company_id']);

        static::sendEmail($admins);
    }

    /**
     * @param Collection|\Illuminate\Support\Collection $users
     */
    protected static function sendEmail($users)
    {
        foreach ($users as $user) {
            $estates       = $user->estate;
            $lotsCount     = $estates->pluck('lots_count')->sum();
            $packagesCount = $estates
                ->pluck('estateLots')
                ->flatten()
                ->pluck('lot_package_count')
                ->sum();

            self::email(
                'emails.new-packages-uploaded-to-estate',
                compact('estates'),
                function (Message $msg) use ($packagesCount, $lotsCount, $user) {
                    $subject = sprintf(
                        "%d %s have been uploaded today for %d %s",
                        $packagesCount,
                        Str::plural('package', $packagesCount),
                        $lotsCount,
                        Str::plural('lot', $lotsCount)
                    );
                    $msg->from(config('mail.from.address'), config('mail.from.name'))
                        ->subject($subject);

                    $msg->to($user->email, $user->display_name);
                    static::appendJobsBCCEmail($msg);
                }
            );
        }
    }
}
