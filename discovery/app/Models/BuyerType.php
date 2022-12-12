<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @method static get(...$args)
 * @method static where(...$args)
 * @method static find($buyerTypeId)
 * @method static findOrFail($buyerTypeId)
 */
class BuyerType extends Model
{
    protected $fillable = ['name'];

    public function brief()
    {
        return $this->belongsTo(Brief::class);
    }
}
