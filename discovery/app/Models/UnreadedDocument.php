<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnreadedDocument extends Model
{
    protected $fillable = [
        'invited_user_id',
        'document_id',
        'document_type'
    ];
}
