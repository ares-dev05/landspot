<?php

namespace App\Jobs\Sitings;

use App\Models\Sitings\Floorplan;
use App\Models\Sitings\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Mail\Message;

class SendNewFloorplanNotificationJob extends SitingsJob
{
    protected $floorplanIds = null;


    /**
     * SendNewFloorplanNotificationJob constructor.
     * @param array $floorplanIds
     */
    public function __construct(array $floorplanIds)
    {
        $this->floorplanIds = $floorplanIds;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        /** @var Collection $floorplans */
        $floorplans = Floorplan::find($this->floorplanIds);
        if ($floorplans->isNotEmpty()) {
            $companyIds = $floorplans->map(function ($f) {
                return $f->company->getKey();
            })->unique()->toArray();
            User::whereIn('has_portal_access', [User::PORTAL_ACCESS_CONTRACTOR])
                ->orWhereHas('group', function (Builder $b) {
                    $b->superAdmins();
                })
                ->whereIn('company_id', $companyIds)
                ->chunk(100, function (Collection $users) use ($floorplans) {
                    foreach ($users as $user) {
                        $this->email(
                            'sitings.emails.new-floorplan',
                            compact('floorplans'),
                            function (Message $msg) use ($user, $floorplans) {
                                static::appendJobsBCCEmail($msg);
                                $title = $floorplans->count() > 1 ? 'plans' : 'plan';
                                $msg->from(config('mail.from.address'), config('mail.from.name'))
                                    ->subject("A new $title has been added by " . $floorplans->first()->company->name);

                                $msg->to($user->email, $user->display_name);
                            }
                        );
                    }
                });
        }
    }
}