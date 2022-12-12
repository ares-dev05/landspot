<?php

namespace App\Jobs;

use App\Models\{Builder, Lot};
use Illuminate\Database\Eloquent\{Builder as EloquentBuilder, Collection, Relations\HasMany, Relations\HasManyThrough};
use Illuminate\Mail\Message;

class SendLotsWithoutPackagesNotificationEmailToBuilderAdminJob extends LandspotJob
{
    protected $estateRelation = 'estate';

    protected function lotVisibilityQb(EloquentBuilder $b, $user)
    {
        return $b->where('visibility', Lot::visibility['all'])
            ->orWhere(function (EloquentBuilder $b) use ($user) {
                $b->where('visibility', Lot::visibility['partial'])
                    ->whereHas('lotVisibility', function (EloquentBuilder $b) use ($user) {
                        $b->where(['company_id' => $user->company_id]);
                    });
            });
    }

    /**
     * @return mixed
     */
    protected function usersQuery()
    {
        return Builder::where(function (EloquentBuilder $b) {
            $b->where(function (EloquentBuilder $b) {
                $b->where('disabled_estates_access', 0)
                    ->whereHas('company', function (EloquentBuilder $b) {
                        $b->where([
                            'chas_footprints'     => 1,
                            'chas_estates_access' => 1,
                            'type'                => 'builder',
                        ]);
                    });
            })->orWhereHas('company', function (EloquentBuilder $b) {
                $b->where([
                    'chas_footprints' => 0,
                    'type'            => 'builder',
                ]);
            });
        })->builderAdmin()
          ->hasEnabledEmailNotifications();
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $this
            ->usersQuery()
            ->chunk(100, function (Collection $users) {
                $users->each(function (Builder $user) {
                    $lotIds = $user->{$this->estateRelation}()->with(['estateLots' => function (HasManyThrough $b) use ($user) {
                        $b->where([
                            'published' => 1,
                            'sold' => 0,
                        ])->where(function (EloquentBuilder $b) use ($user) {
                            return $this->lotVisibilityQb($b, $user);
                        })->whereHas('lotPackage', function (EloquentBuilder $b) use ($user) {
                            $b->where($b->qualifyColumn('company_id'), $user->company_id);
                        });
                    }])
                        ->get()
                        ->pluck('estateLots')
                        ->flatten()
                        ->pluck('id');

                    $uploadedPackages = $user->lotPackages()->select('lot_id')
                        ->selectRaw('COUNT(*) AS packages_count')
                        ->whereIn('lot_id', $lotIds)
                        ->groupBy('lot_id')->get();


                    $user->load([$this->estateRelation => function ($b) use ($user) {
                        $b->whereHas('stage', function (EloquentBuilder $b) use ($user) {
                            $b->where([
                                'published' => 1,
                                'sold' => 0
                            ])->whereHas('lots', function (EloquentBuilder $b) use ($user) {
                                $b->where(function (EloquentBuilder $b) use ($user) {
                                    $b->where('status', 'Available')
                                        ->where(function (EloquentBuilder $b) use ($user) {
                                            return $this->lotVisibilityQb($b, $user);
                                        });
                                })->whereDoesntHave('lotPackage', function (EloquentBuilder $b) use ($user) {
                                    $b->where($b->qualifyColumn('company_id'), $user->company_id);
                                });
                            });
                        })->withCount(['estateLots as without_packages_count' => function (EloquentBuilder $b) use ($user) {
                            $b->where([
                                'published' => 1,
                                'sold' => 0,
                            ])->where(function (EloquentBuilder $b) use ($user) {
                                $b->where('status', 'Available')
                                    ->where(function (EloquentBuilder $b) use ($user) {
                                        return $this->lotVisibilityQb($b, $user);
                                    });
                            })->whereDoesntHave('lotPackage', function (EloquentBuilder $b) use ($user) {
                                $b->where(
                                    $b->qualifyColumn('company_id'),
                                    $user->company_id
                                );
                            });
                        }]);
                    }]);


                    $lotsWithoutPackagesCount = $user->{$this->estateRelation}->pluck('without_packages_count')->sum();
                    if ($lotsWithoutPackagesCount) {
                        $estates = $user->{$this->estateRelation};
                        self::email(
                            'emails.lots-without-packages-builder-admin',
                            compact('user', 'uploadedPackages', 'estates'),
                            function (Message $msg) use ($user, $lotsWithoutPackagesCount) {
                                static::appendJobsBCCEmail($msg);
                                $msg->from(config('mail.from.address'), config('mail.from.name'))
                                    ->subject("Landspot - There are {$lotsWithoutPackagesCount} Lots Without H&L Packages!");

                                $msg->to($user->email, $user->display_name);
                            }
                        );
                    }
                });
            });
    }
}
