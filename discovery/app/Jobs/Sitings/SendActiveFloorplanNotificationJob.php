<?php

namespace App\Jobs\Sitings;

use App\Models\Sitings\Floorplan;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Mail\Message;

class SendActiveFloorplanNotificationJob extends SitingsJob
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
            $floorplan
                ->company
                ->user()
                ->chunk(100, function (Collection $users) use ($floorplan) {
                    foreach ($users as $user) {
                        $this->email(
                            'sitings.emails.active-floorplan',
                            compact('floorplan'),
                            function (Message $msg) use ($user, $floorplan) {
                                static::appendJobsBCCEmail($msg);
                                $msg->from(config('mail.from.address'), config('mail.from.name'))
                                    ->subject('Your floorplan has been activated');
                                $msg->to($user->email, $user->display_name);
                            }
                        );
                    }
                });
        }
    }
}