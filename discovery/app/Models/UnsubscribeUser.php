<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnsubscribeUser extends Model
{
    protected $guarded = [];
    const USER_TYPE = [
        'client' => 1,
        'user' => 2
    ];
}
