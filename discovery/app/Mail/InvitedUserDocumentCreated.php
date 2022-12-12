<?php

namespace App\Mail;

use App\Models\InvitedUser;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InvitedUserDocumentCreated extends Mailable
{
    use Queueable, SerializesModels;

    public $invitedUser;
    public $user;
    public $invitationToken;

    /**
     * Create a new message instance.
     *
     * @param InvitedUser $invitedUser
     * @param $user
     * @param null $invitationToken
     */
    public function __construct(InvitedUser $invitedUser, $user, $invitationToken = null)
    {
        $this->invitedUser     = $invitedUser;
        $this->user            = $user;
        $this->invitationToken = $invitationToken;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->from(config('mail.support.lotmix'), config('app.LOTMIX_FROM_NAME'))
            ->subject("New Information From " . $this->user->company->name)
            ->view('emails.invited-user-document');
    }
}
