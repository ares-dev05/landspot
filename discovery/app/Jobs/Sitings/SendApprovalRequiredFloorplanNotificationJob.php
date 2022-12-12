<?php

namespace App\Jobs\Sitings;

use App\Models\Sitings\Floorplan;
use App\Models\Sitings\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Mail\Message;

class SendApprovalRequiredFloorplanNotificationJob extends SitingsJob
{
    protected $floorplanId = null;


    /**
     * SendActiveFloorplanNotificationJob constructor.
     * @param $floorplanId
     */
    public function __construct($floorplanId)
    {
        $this->floorplanId = $floorplanId;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        /** @var Floorplan $floorplan */
        $floorplan = Floorplan::find($this->floorplanId);
        if ($floorplan) {
            User::whereHas('group', function (Builder $b) {
                $b->superAdmins();
            })->chunk(100, function (Collection $users) use ($floorplan) {
                    foreach ($users as $user) {
                        $this->email(
                            'sitings.emails.requires-approval-floorplan',
                            compact('floorplan'),
                            function (Message $msg) use ($user, $floorplan) {
                                static::appendJobsBCCEmail($msg);
                                $msg->from(config('mail.from.address'), config('mail.from.name'))
                                    ->subject('You have a plan that needs approval');
                                $msg->to($user->email, $user->display_name);
                            }
                        );
                    }
                });
        }
    }
}