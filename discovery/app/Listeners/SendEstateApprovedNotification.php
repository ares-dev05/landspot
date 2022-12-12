<?php

namespace App\Listeners;

use App\Events\EstateApproved;
use App\Models\User;
use App\Models\UserGroup;

use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;

class SendEstateApprovedNotification
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  EstateApproved $event
     * @return void
     */
    public function handle(EstateApproved $event)
    {
        $estate = $event->estate;
        $users = $estate->company->user;

        $admins = $users->filter(function (User $user) {
            return $user->hasGroup(UserGroup::GroupDeveloperAdmins);
        });


        if ($admins->isNotEmpty()) {
            Mail::send(
                'emails.approved-estate',
                [
                    'estate' => $event->estate
                ],
                function (Message $msg) use ($admins) {

                    $msg->from(config('mail.from.address'), config('mail.from.name'))
                        ->subject('Estate approval');

                    foreach ($admins as $admin) {
                        $msg->to($admin->email, $admin->display_name);
                    }
                }
            );
        }
    }
}
