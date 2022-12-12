<?php

namespace App\Mail;

use App\Models\InvitedUser;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SendEmailEnquireOnce extends Mailable
{
    use Queueable, SerializesModels;

    public $invitedUser;
    public $type;
    public $data;

    /**
     * Create a new message instance.
     *
     * @param InvitedUser $invitedUser
     * @param string $type = 'Brief Admin'
     * @param array $data = [
     *      'buyer_type'          => 'Investor',
     *      'pre_approval'        => false,
     *      'land'                => 'need_land|have_land',
     *      'suburbs'             => 'Melbourne',
     *      'lot_number'          => 1,
     *      'street_name'         => 'street',
     *      'estate_name'         => 'vic',
     *      'region'              => 'West',
     *      'house_requirements'  => [
     *          'bedrooms' => 1,
     *          'bathrooms' => 1,
     *          'story' => 'single'
     *      ]
     *    ]
     */
    public function __construct(InvitedUser $invitedUser, string $type, array $data)
    {
        $this->type = $type;
        $this->invitedUser = $invitedUser;
        $this->data = $data;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->from(config('mail.support.lotmix'))
            ->subject('New Lotmix Lead - Respond Now')
            ->view('emails.enquire-once-to-admin');
    }
}
