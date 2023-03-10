<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use \Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Support\Facades\DB;


/**
 * Class State
 * @property string abbrev
 * @property string name
 * @property LotmixStateSettings lotmixSettings
 *
 * @method static byAbbrev($state)
 * @method static get(...$args)
 * @method static byEstateSuburbs(mixed $suburbs)
 */
class State extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'house_states';
    protected $fillable = ['abbrev', 'name'];

    function estate()
    {
        return $this->hasMany(Estate::class, 'state_id');
    }

    function lotmixSettings()
    {
        return $this->hasMany(LotmixStateSettings::class, 'state_id');
    }

    /**
     * @param Company $company
     * @return mixed
     */
    function getLotmixSettingsValue(Company $company)
    {
        return $this->lotmixSettings()->byCompany($company->id)->first()->value ?? LotmixStateSettings::SAVE_AND_EXPORT;
    }

    /**
     * @param Company $company
     * @return mixed
     */
    function getLotmixAccess(Company $company)
    {
        return $this->lotmixSettings()->byCompany($company->id)->first()->has_lotmix ?? LotmixStateSettings::LOTMIX_ACCESS_DISABLED;
    }
    /**
     * @param Company $company
     * @return mixed
     */
    function getSitingAccess(Company $company)
    {
        return $this->lotmixSettings()->byCompany($company->id)->first()->has_siting_access ?? LotmixStateSettings::LOTMIX_ACCESS_DISABLED;
    }

    /**
     * @param Company $company
     * @return int whether estates are disabled for the company on the current state. Enabled by default
     */
    function getEstatesDisabled(Company $company)
    {
        return $this->lotmixSettings()->byCompany($company->id)->first()->has_estates_disabled ?? LotmixStateSettings::ESTATES_ACCESS_ENABLED;
    }

    /**
     * @param EloquentBuilder $b
     * @param string $stateAbbrev
     * @return EloquentBuilder
     */
    function scopeByAbbrev(EloquentBuilder $b, string $stateAbbrev)
    {
        return $b->where('abbrev', strtolower($stateAbbrev));
    }

    function scopeByEstateSuburbs(EloquentBuilder $b, array $suburbs)
    {
        return $b->whereHas('estate',  function ($q) use ($suburbs) {
            $q->whereIn('suburb', $suburbs);
        });
    }

    /**
     * Get all state by company_id through the house_ranges table
     *
     * @param int $companyId
     * @return \Illuminate\Support\Collection
     */
    public static function getStatesByCompanyId($companyId = 0)
    {
        return DB::table('companies as c')
            ->select('hs.*')
            ->distinct()
            ->join('house_ranges as hr', 'c.id', '=', 'hr.cid')
            ->join('house_states as hs', 'hr.state_id', '=', 'hs.id')
            ->where('c.id', '=', $companyId)
            ->get();
    }
}
