<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class EstateAmenity
 * @property int id
 * @property int estate_id
 * @property int type
 * @property float lat
 * @property float long
 * @property string name
 * @property Estate estate
 *
 */
class EstateAmenity extends Model
{
    protected $guarded = [];
    public $timestamps = false;

    /**
     * The array of document types.
     *
     * @var array
     */
    const TYPES = [
        'education' => 0,
        'health' => 1,
        'shopping' => 2,
        'dining' => 3,
        'clubs' => 4
    ];
    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['type_name'];

    public static function boot()
    {
        parent::boot();
        self::creating(function (EstateAmenity $estateAmenity) {
            $estateAmenity->type = EstateAmenity::TYPES[$estateAmenity->type];
        });
    }

    // Relations
    function estate()
    {
        return $this->belongsTo(Estate::class);
    }
    // Attributes

    /**
     * Get the stage name flag for the stage table.
     *
     * @return string
     */
    public function getTypeNameAttribute()
    {
        return array_search($this->type, self::TYPES);
    }
}
