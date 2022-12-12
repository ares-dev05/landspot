<?php

namespace App\Listeners;

use App\Events\EstateCreated;
use App\Models\User;
use App\Models\UserGroup;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;

class SendAdminEstateNotification
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
     * @param  EstateCreated $event
     * @return void
     */
    public function handle(EstateCreated $event)
    {
        $admins = UserGroup::superAdmins()
            ->first(['id'])
            ->user()
            ->get(['email', 'display_name']);

        if ($admins->isNotEmpty()) {
            Mail::send(
                'emails.new-estate',
                [
                    'estate' => $event->estate,
                    'user'   => $event->user
                ],
                function (Message $msg) use ($admins) {

                    $msg->from(config('mail.from.address'), config('mail.from.name'))
                        ->subject('A new estate was added');

                    foreach ($admins as $admin) {
                        $msg->to($admin->email, $admin->display_name);
                    }
                }
            );
        }
    }
}
