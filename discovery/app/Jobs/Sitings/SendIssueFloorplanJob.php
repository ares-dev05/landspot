<?php

namespace App\Jobs\Sitings;

use App\Models\Sitings\{Floorplan, User};
use Illuminate\Database\Eloquent\{Builder, Collection};
use Illuminate\Mail\Message;

class SendIssueFloorplanJob extends SitingsJob
{
    protected $contractorId = null;
    protected $floorplanId = null;
    protected $note = null;

    /**
     * SendActiveFloorplanNotificationJob constructor.
     * @param $floorplanId
     * @param $note
     * @param $contractorId
     */
    public function __construct(int $floorplanId, string $note, int $contractorId)
    {
        $this->floorplanId  = $floorplanId;
        $this->note         = $note;
        $this->contractorId = $contractorId;
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
        $contractor = User::find($this->contractorId);

        if ($floorplan && $contractor) {
            User::whereHas('group', function (Builder $b) {
                $b->superAdmins();
            })->chunk(100, function (Collection $users) use ($floorplan, $note, $contractor) {
                    foreach ($users as $user) {
                        $this->email(
                            'sitings.emails.issue-floorplan',
                            compact('floorplan', 'note', 'contractor'),
                            function (Message $msg) use ($user, $floorplan, $contractor) {
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