<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    protected $fillable = [
        'brief_id',
        'total_budget',
        'house_budget',
        'land_budget'
    ];

    public function brief()
    {
        return $this->belongsTo(Brief::class);
    }
}
