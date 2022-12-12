<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Volume extends HouseEntity
{
    protected $fillable = [
        'path', 'house_id'
    ];

    public function house()
    {
        return $this->belongsTo(House::class);
    }
}
