<?php

namespace App\Jobs;

use App\Models\UserInvitedUsers;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;



class CountOfInvitedUsersPerDay implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $email = "jeremy.santi@landconnect.com.au";
        $invitedUserCount = UserInvitedUsers::whereDate('created_at', Carbon::today())->count();

        Mail::send('emails.count-invited-user', compact('invitedUserCount'), function (Message $message) use ($email){
            $message->to($email)->subject('Count of invited users.');
        });
    }
}
