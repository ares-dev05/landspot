<?php

namespace App\Models;

use Illuminate\Support\Str;

/**
 * Class EstateAmenities
 * @property string slug
 * @package App\Models
 */
class EstateAmenities extends Estate
{
    protected $table = 'estates';

    /**
     * Extra fields
     * @var array
     */
    protected $appends = [
        'slug'
    ];

    public static function boot()
    {
        parent::boot();

        static::retrieved(function (EstateAmenities $estate) {
            $estate->slug = Str::slug($estate->name);
        });
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}