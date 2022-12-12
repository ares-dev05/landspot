<?php

namespace App\Models;

use App\Models\Lot;
use Illuminate\Database\Eloquent\Model;

/**
 * Class LotVisibility
 * @property Lot lot
 */
class LotVisibility extends Model
{
    protected $table = 'lots_visibility';
    protected $fillable = [
        'lot_id', 'company_id'
    ];

    public $timestamps = false;

    public function lot()
    {
        return $this->belongsTo(Lot::class);
    }

    function builderCompany()
    {
        return $this->hasOne(Company::class, 'id', 'company_id');
    }

    function scopeByLotId(\Illuminate\Database\Eloquent\Builder $b, $lotId)
    {
        return $this->where('lot_id', $lotId);
    }

    static function boot()
    {
        parent::boot();
        /*foreach (['deleted', 'saved'] as $event) {
            static::registerModelEvent($event, function (LotVisibility $lotVisibility) {
                $lotVisibility->lot->recalculateVisibility();
            });
        }*/
    }
}
