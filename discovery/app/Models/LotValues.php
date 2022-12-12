<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LotValues extends Model
{
    protected $fillable = ['lot_id', 'lot_attr_id', 'value'];

    public $timestamps = false;

    public function lots()
    {
        return $this->belongsTo(Lot::class);
    }

    public function lotAttributes()
    {
        return $this->belongsTo(LotAttributes::class);
    }

}
