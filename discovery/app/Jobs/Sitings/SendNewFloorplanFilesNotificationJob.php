<?php

namespace App\Jobs\Sitings;

use App\Models\Sitings\Floorplan;
use App\Models\Sitings\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Mail\Message;

class SendNewFloorplanFilesNotificationJob extends SitingsJob
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
        $company   = $floorplan->company->name;
        if ($floorplan) {
            User::where('has_portal_access', User::PORTAL_ACCESS_CONTRACTOR)
                ->chunk(100, function (Collection $users) use ($floorplan, $company) {
                    foreach ($users as $user) {
                        $this->email(
                            'sitings.emails.new-floorplan-files',
                            compact('floorplan'),
                            function (Message $msg) use ($user, $floorplan, $company) {
                                static::appendJobsBCCEmail($msg);
                                $msg->from(config('mail.from.address'), config('mail.from.name'))
                                    ->subject($company . ' uploaded new files to floorplan');
                                $msg->to($user->email, $user->display_name);
                            }
                        );
                    }
                });
        }
    }
}