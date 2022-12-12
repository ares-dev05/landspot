<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * ShortList class
 * @property int id
 * @property int estate_short_list_id
 * @property int lot_id
 * @property int stage_id
 * @property int lot_number
 * @property string stage_name
 * @property Lot lot
 * @property Stage stage
 * @property EstateShortList estateShortList
 */
class ShortList extends Model
{
    use WithAndWhereHasTrait;
    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

    /**
     * Determines if a table has a timestamp
     *
     * @var boolean
     */
    public $timestamps = false;

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['lot_number', 'stage_name'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    function lot()
    {
        return $this->belongsTo(Lot::class);
    }
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    function stage()
    {
        return $this->belongsTo(Stage::class);
    }
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    function estateShortList()
    {
        return $this->belongsTo(EstateShortList::class);
    }

    /**
     * Get the lot number flag for the lot table.
     *
     * @return int
     */
    function getLotNumberAttribute()
    {
        return $this->lot()->first()->lot_number;
    }
    /**
     * Get the stage name flag for the stage table.
     *
     * @return string
     */
    public function getStageNameAttribute()
    {
        return $this->stage()->first()->name;
    }
}
