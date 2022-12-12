<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SMSVerification extends Model
{
    protected $table = 'sms_verifications';

    protected $fillable = ['invited_user_id', 'code', 'verified'];

    public function invitedUser()
    {
        return $this->belongsTo(InvitedUser::class);
    }
}
