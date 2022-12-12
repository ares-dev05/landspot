<?php

namespace App\Jobs;

use App\Models\InvitedUser;
use App\Models\UnsubscribeUser;
use App\Models\UserInvitedUsers;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Message;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;

class FollowUpMails implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    const EMAIL_SUBJECTS = [
        'REMINDER: Your Lotmix invite is waiting for you!',
        '100 + things not to forget when building a home.',
        'Incase you missed it'
    ];

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $usersGroups = [];
        $usersGroups[] = InvitedUser::withAndWhereHas('userInvitations', function ($query) {
            $query->where([
                'email_type' => UserInvitedUsers::EMAIL_TYPES['24hours'],
                'status' => UserInvitedUsers::STATUS_PENDING
            ])
                ->where('created_at', '<=', Carbon::now()->subHours(24))
                ->where('created_at', '>', Carbon::now()->subHours(48));
        })->get();

        $usersGroups[] = InvitedUser::withAndWhereHas('userInvitations', function ($query) {
            $query->where([
                'email_type' => UserInvitedUsers::EMAIL_TYPES['48hours'],
                'status' => UserInvitedUsers::STATUS_PENDING
            ])
                ->where('created_at', '<=', Carbon::now()->subHours(48))
                ->where('created_at', '>', Carbon::now()->subHours(96));
        })->get();

        $usersGroups[] = InvitedUser::withAndWhereHas('userInvitations', function ($query) {
            $query->where([
                'email_type' => UserInvitedUsers::EMAIL_TYPES['96hours'],
                'status' => UserInvitedUsers::STATUS_PENDING
            ])
                ->where('created_at', '<=', Carbon::now()->subHours(96))
                ->where('created_at', '>', Carbon::now()->subDays(30));
        })->get();

        $this->mailing($usersGroups);
    }

    protected function mailing(array $usersGroups)
    {
        foreach ($usersGroups as $index => $users) {
            $users->each(function (InvitedUser $user) use ($index) {
                if ($user->email && $user->unsubscribed()->doesntExist() && \EmailDisabledCheckHelper::checkEmail($user->email)) {
                    $user->userInvitations->each(function (UserInvitedUsers $u) use ($user, $index) {
                        $company = $u->company;
                        $hash = Crypt::encrypt([
                            'type' => UnsubscribeUser::USER_TYPE['client'],
                            'email' => $user->email
                        ]);
                        $data = compact('user', 'company', 'hash');
                        if ($u->invitation_token) {
                            $data['invitationToken'] = $user->getHashedToken($u->invitation_token);
                        }
                        Mail::send("emails.follow-up-$index", $data, function (Message $msg) use ($user, $index) {
                            $msg->from(config('mail.support.lotmix'), config('mail.from.lotmix_name'))
                                ->to($user->email, $user->display_name)
                                ->subject(FollowUpMails::EMAIL_SUBJECTS[$index]);
                        });
                        if ($u->email_type >= UserInvitedUsers::EMAIL_TYPES['96hours']) {
                            $u->update(['email_type' => null]);
                        } else {
                            $u->increment('email_type');
                        }
                    });
                }
            });
        }
    }
}
