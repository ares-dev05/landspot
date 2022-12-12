<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;

/**
 * Class LotmixStateSettings
 * @property int company_id
 * @property int state_id
 * @property int value
 * @property int has_lotmix
 * @property int has_siting_access
 * @property Company company
 * @property State state
 * @method static LotmixStateSettings byCompany()(...$args)
 */
class LotmixStateSettings extends Model
{
    const SAVE_AND_EXPORT  = 0;
    const ASSIGN_TO_CLIENT = 1;

    const LOTMIX_ACCESS_DISABLED = 0;
    const LOTMIX_ACCESS_ENABLED  = 1;

    const SITING_ACCESS_DISABLED = 0;
    const SITING_ACCESS_ENABLED  = 1;

    const ESTATES_ACCESS_ENABLED    = 0;
    const ESTATES_ACCESS_DISABLED   = 1;

    const SITING_SAVE_SETTINGS = [
        self::SAVE_AND_EXPORT => 'Save and PDF',
    ];

    const SITING_EXPORT_PERMISSIONS = [
        self::ASSIGN_TO_CLIENT => 'ASSIGN_TO_CLIENT',
        self::SAVE_AND_EXPORT  => 'SAVE_AND_EXPORT',
    ];

    protected $table = 'lotmix_state_settings';

    public $timestamps = false;

    protected $fillable = [
        'company_id', 'state_id', 'value', 'has_lotmix', 'has_siting_access', 'has_estates_disabled'
    ];

    protected $hidden = ['id', 'company_id', 'state_id'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function state()
    {
        return $this->belongsTo(State::class);
    }

    /**
     * @param EloquentBuilder $b
     * @param $id
     * @return EloquentBuilder
     */
    function scopeByCompany(EloquentBuilder $b, $id)
    {
        return $b->where('company_id', $id);
    }
}
