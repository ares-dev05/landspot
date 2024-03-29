<?php

namespace App\Jobs\Sitings;

use App\Models\Sitings\{Floorplan, User};
use Illuminate\Database\Eloquent\{Builder, Collection};
use Illuminate\Mail\Message;

class SendContractorIssueRejectedFloorplanJob extends SitingsJob
{
    protected $floorplanId = null;
    protected $note = null;

    /**
     * SendActiveFloorplanNotificationJob constructor.
     * @param $floorplanId
     * @param $note
     */
    public function __construct(int $floorplanId, string $note)
    {
        $this->floorplanId  = $floorplanId;
        $this->note         = $note;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        /** @var Floorplan $floorplan */
        $floorplan  = Floorplan::find($this->floorplanId);
        $note       = $this->note;

        if ($floorplan) {
            User::whereHas('group', function (Builder $b) {
                $b->superAdmins();
            })->chunk(100, function (Collection $users) use ($floorplan, $note) {
                    foreach ($users as $contractor) {
                        $this->email(
                            'sitings.emails.issue-rejected-floorplan',
                            compact('floorplan', 'note', 'contractor'),
                            function (Message $msg) use ($contractor, $floorplan) {
                                static::appendJobsBCCEmail($msg);
                                $msg->from(config('mail.from.address'), config('mail.from.name'))
                                    ->subject('Floorplan issue has been rejected');
                                $msg->to($contractor->email, $contractor->display_name);
                            }
                        );
                    }
                });
        }
    }
}