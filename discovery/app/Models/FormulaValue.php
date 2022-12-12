<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class KaspaFormula
 * @property int id
 * @property int formula_id
 * @property object values
 *
 */
class FormulaValue extends Model
{
    protected $guarded = [];
    public $timestamps = false;
    protected $casts = [
        'values' => 'array'
    ];

    /**
     * Get the parent formulaValues model (Estate or Stage).
     */
    public function reference()
    {
        return $this->morphTo();
    }

    /**
     * Get the parent formulaValues model (Estate or Stage).
     */
    public function formula()
    {
        return $this->belongsTo(KaspaFormula::class);
    }
}
