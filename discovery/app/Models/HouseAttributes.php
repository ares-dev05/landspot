<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class HouseAttributes
 * @property int house_id
 * @property int beds
 * @property int bathrooms
 * @property float price
 * @property float width
 * @property float depth
 * @property float size
 * @property string size_units (m2 or sq)
 * @property int story
 * @property int cars
 * @property string description
 * @property House house
 */
class HouseAttributes extends Model
{
    const sq_m = 9.290304;

    protected static function boot()
    {
        parent::boot();
        static::saving(function (HouseAttributes $attributes) {
            $type = $attributes->getAttributeFromArray('size_units');
            $size = $attributes->getAttributeFromArray('size');
            if ($type == 'sq') {
                $size *= self::sq_m;
            }
            $attributes->setAttribute('size', $size);
        });
    }

    protected $fillable = [
        'house_id',
        'beds',
        'bathrooms',
        'price',
        'width',
        'depth',
        'size',
        'size_units',
        'story',
        'cars',
        'description',
    ];

    public function house()
    {
        return $this->belongsTo(House::class);
    }

    function setDescriptionAttribute($v)
    {
        $this->attributes['description'] = trim($v);
    }

    //return converted area size according to type of units
    //in DB size always is stored in m2
    function getAreaSizeAttribute()
    {
        $v = $this->getAttributeFromArray('size');
        if ($v !== null && $this->size_units === 'sq') {
            $v /= self::sq_m;
        }

        return $v;
    }
}
