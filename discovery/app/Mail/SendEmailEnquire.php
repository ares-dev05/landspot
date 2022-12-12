<?php

namespace App\Mail;

use App\Models\InvitedUser;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SendEmailEnquire extends Mailable
{
    use Queueable, SerializesModels;

    public $invitedUser;
    public $type;
    public $region;
    public $buyerType;
    public $estateName;
    public $lotNumber;

    /**
     * Create a new message instance.
     *
     * @param InvitedUser $invitedUser
     * @param array $mailData = [
     *             'type'  => 'estate manager', // (Required) builder, Brief Admin, etc.
     *             'region' => 'North', // (optional) Region name
     *             'buyerType' => 'Upgrader', // (optional) BuyerType name
     *             'estateName' => 'Clearview', // (optional) Estate name
     *             'lotNumber' => '4', // (optional) Lot number
     * ]
     */
    public function __construct(InvitedUser $invitedUser, array $mailData = [])
    {
        $this->invitedUser = $invitedUser;
        $this->type = data_get($mailData, 'type');
        $this->region = data_get($mailData, 'region');
        $this->buyerType = data_get($mailData, 'buyerType');
        $this->estateName = data_get($mailData, 'estateName');
        $this->lotNumber = data_get($mailData, 'lotNumber');
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->from(config('mail.support.lotmix'))
            ->subject('Lotmix Lead')
            ->view('emails.lotmix-enquire');
    }
}
