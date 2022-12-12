<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPassword extends Notification
{
    use Queueable;

    /**
     * The password reset token.
     *
     * @var string
     */
    public $token;

    /**
     * Create a new notification instance.
     *
     * @param  string  $token
     * @return void
     */
    public function __construct($token)
    {
        $this->token = $token;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Build the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $appHost     = parse_url(config('app.url'), PHP_URL_HOST);
        $oauthHost   = parse_url(config('app.OAUTH_PROVIDER_URL'), PHP_URL_HOST);
        $lotmixHost  = parse_url(config('app.LOTMIX_URL'), PHP_URL_HOST);
        $currentHost = request()->getHost();

        $url         = config('app.url');
        $fromAddress = config('mail.from.address');
        $fromName    = config('mail.from.name');

        if ($currentHost == $oauthHost) {
            $url         = config('app.OAUTH_PROVIDER_URL');
            $fromAddress = 'support@landconnect.com.au';
            $fromName    = 'Landconnect Support';
        } elseif ($currentHost == $lotmixHost) {
            $url         = config('app.LOTMIX_URL');
            $fromAddress = 'support@landconnect.com.au';
            $fromName    = 'Landconnect Support';
        }

        $msg = (new MailMessage)
            ->from($fromAddress, $fromName)
            ->subject('Reset Password Notification')
            ->line('You are receiving this email because we received a password reset request for your account.')
            ->action('Reset Password', url($url.route('password.reset', ['token' => $this->token], false)))
            ->line('If you did not request a password reset, no further action is required.');
        return $msg;
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            //
        ];
    }
}
