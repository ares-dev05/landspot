<?php

namespace App\Models;

use App\Models\FormulaValue;
use Illuminate\Database\Eloquent\Model;

/**
 * Class KaspaFormula
 * @property int id
 * @property string description
 *
 * @method static where(...$args)
 */
class KaspaFormula extends Model
{
    protected $guarded = [];
    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    function formulaValues()
    {
        return $this->hasMany(FormulaValue::class);
    }
}
