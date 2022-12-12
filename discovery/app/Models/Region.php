<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Region
 * @method static get(...$args)
 * @method static where(...$args)
 * @method static find($regionId)
 * @method static findOrFail($regionId)
 */
class Region extends Model
{
    protected $fillable = ['name'];

    public function brief()
    {
        return $this->belongsTo(Brief::class);
    }
}
