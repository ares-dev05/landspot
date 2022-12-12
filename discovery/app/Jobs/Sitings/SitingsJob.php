<?php

namespace App\Jobs\Sitings;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Mail\Message;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\{App, Mail};

abstract class SitingsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected static function appendJobsBCCEmail(Message $msg)
    {
        if (App::environment('production')) {
            $msg->addBcc(config('mail.support.jobsBCC'));
        }
    }

    protected function email($viewName, array $data, \Closure $closure)
    {
        try {
            $throttleEmails = App::environment('local') && config('mail.host') === 'smtp.mailtrap.io';
            if ($throttleEmails && cache('dev_emails_throttle')) {
                //550 5.7.0 Requested action not taken: too many emails per second
                sleep(5);
            }

            Mail::send($viewName, $data, $closure);
            if ($throttleEmails) {
                cache(['dev_emails_throttle' => 1], 5);
            }

        } catch (\Exception $e) {
            logger()->error(static::class . ':sendEmail - ' . $e->getMessage());
            $this->fail($e);
        }
    }
}