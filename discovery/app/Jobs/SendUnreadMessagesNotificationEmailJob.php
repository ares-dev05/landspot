<?php

namespace App\Jobs;

use App\Models\{EmailNotification, User};
use Illuminate\Database\Eloquent\{Builder, Collection};
use Illuminate\Mail\Message;

class SendUnreadMessagesNotificationEmailJob extends LandspotJob
{
    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        User::hasEnabledEmailNotifications()
            ->where(function (Builder $b) {
                $b->whereHas('emailNotifications', function (Builder $b) {
                    $b->where([
                        'type'    => EmailNotification::typeNewChatMessages,
                        'enabled' => 1
                    ]);
                })
                  ->orWhereDoesntHave('emailNotifications');
            })
            ->whereHas('userChat', function (Builder $b) {
                $b->where('unread_messages', '>', 0);
                $b->whereRaw('last_message_ts < UNIX_TIMESTAMP()');
            })
            ->chunk(100, function (Collection $users) {
                $users->each(function (User $user) {
                    $emailNotification = $user->emailNotifications()->where([
                        'type'    => EmailNotification::typeNewChatMessages,
                        'enabled' => 1
                    ])->first();


                    $delayIndex   = 0;
                    $lastSentTime = 0;
                    if ($emailNotification) {
                        $lastSentTime = $emailNotification->sent_at;
                        $delayIndex = (int)($emailNotification->value['delay'] ?? 0) + 1;
                        if ($delayIndex < 0 || $delayIndex >= count(EmailNotification::chatNotificationDelays)) {
                            return;
                        }
                    }

                    $lastMsgTimestamp = $user->userChat()->max('last_message_ts');

                    $currentTime = time();
                    if ($lastMsgTimestamp + 3600 > $currentTime && $lastSentTime <= 0) {
                        return;
                    }

                    if ($lastSentTime + EmailNotification::chatNotificationDelays[$delayIndex] <= $currentTime) {
                        SendUnreadMessagesNotificationEmailJob::email(
                            'emails.chat-new-messages',
                            [
                                'name' => $user->display_name
                            ],
                            function (Message $msg) use ($user) {
                                static::appendJobsBCCEmail($msg);
                                $msg->from(config('mail.from.address'), config('mail.from.name'))
                                    ->subject('Someone has sent you a message via Live Chat on Landspot');

                                $msg->to($user->email, $user->display_name);
                            }
                        );

                        $user->emailNotifications()
                             ->updateOrCreate([
                                 'type' => EmailNotification::typeNewChatMessages],
                                 [
                                     'sent_at' => time(),
                                     'value'   => [
                                         'delay' => $delayIndex
                                     ]
                                 ]
                             );
                    }
                });
            });
    }
}
