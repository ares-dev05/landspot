<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class EstateSnapshot
 * @property int id
 * @property int estate_id
 * @property int type
 * @property float lat
 * @property float long
 * @property string name
 * @property int distance
 * @property Estate estate
 *
 * @method static where(...$args)
 */
class EstateSnapshot extends Model
{
    protected $guarded = [];
    public $timestamps = false;

    /**
     * The array of document types.
     *
     * @var array
     */
    const TYPES = [
        'Closest School' => 0,
        'Closest Shopping Centre' => 1,
        'Time to CBD' => 2,
    ];
    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['type_name'];

    /**
     * Relations
     */

    function estate(): BelongsTo
    {
        return $this->belongsTo(Estate::class);
    }

    /**
     * Attributes
     */

    /**
     * Get the stage name flag for the stage table.
     *
     * @return string
     */
    public function getTypeNameAttribute(): string
    {
        return array_search($this->type, self::TYPES);
    }
}
