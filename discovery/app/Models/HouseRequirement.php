<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HouseRequirement extends Model
{
    protected $fillable = [
        'brief_id',
        'single_story',
        'double_story',
        'bedrooms',
        'bathrooms',
    ];

    public function brief()
    {
        return $this->belongsTo(Brief::class);
    }
}
