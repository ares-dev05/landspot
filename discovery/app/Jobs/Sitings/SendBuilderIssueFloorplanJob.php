<?php

namespace App\Jobs\Sitings;

use App\Models\Sitings\{Floorplan, User};
use Illuminate\Database\Eloquent\{Builder, Collection};
use Illuminate\Mail\Message;

class SendBuilderIssueFloorplanJob extends SitingsJob
{
    protected $floorplanId = null;
    protected $note = null;

    /**
     * SendActiveFloorplanNotificationJob constructor.
     * @param $floorplanId
     * @param $note
     */
    function __construct(int $floorplanId, string $note)
    {
        $this->floorplanId = $floorplanId;
        $this->note        = $note;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    function handle()
    {
        /** @var Floorplan $floorplan */
        $floorplan = Floorplan::find($this->floorplanId);
        $note      = $this->note;

        if ($floorplan) {
            $floorplan
                ->company
                ->user()
                ->byPortalAccess(User::PORTAL_ACCESS_BUILDER)
                ->chunk(100, function (Collection $users) use ($floorplan, $note) {
                    foreach ($users as $user) {
                        $this->email(
                            'sitings.emails.builder-issue-floorplan',
                            compact('floorplan', 'note'),
                            function (Message $msg) use ($user, $floorplan) {
                                static::appendJobsBCCEmail($msg);
                                $msg->from(config('mail.from.address'), config('mail.from.name'))
                                    ->subject('A floorplan has issues');
                                $msg->to($user->email, $user->display_name);
                            }
                        );
                    }
                });
        }
    }
}