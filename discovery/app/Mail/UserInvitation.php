<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class UserInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $data;
    public $isBuilder;

    /**
     * Create a new message instance.
     *
     * @param $user
     * @param $data
     * @param $isBuilder
     */
    public function __construct($user, $data, $isBuilder)
    {
        $this->user = $user;
        $this->data = $data;
        $this->isBuilder = $isBuilder;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $mail = $this->to($this->user->email, $this->user->display_name)->with($this->data);
        return $this->isBuilder ? $mail->subject('Welcome to Landconnect')->view('emails.builder-invitation') :
            $mail->subject('Invitation to ' . config('app.name'))->view('emails.invitation');
    }
}
