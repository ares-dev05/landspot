<?php

namespace App\Models;

/**
 * Class LandDeveloper
 * @method static LandDeveloper getUser()
 */

use App\Models\Sitings\HasSitingTrait;
use \Illuminate\Database\Query\{
    Builder as QueryBuilder,
    JoinClause
};

class Builder extends User
{
    use HasSitingTrait;
    function salesLocation()
    {
        return $this->belongsToMany(SalesLocation::class, 'builder_sales_location', 'user_id', 'location_id');
    }

    /**
     * @return House
     */
    function getBuilderHousesAttribute()
    {
        $rangeIds = $this->getUserRanges()->pluck('id');
        return House::byRangesIds($rangeIds)->byDiscovery(House::DISCOVERY_ENABLE);
    }

    function getBaseRoute()
    {
        $canFootprints    = $this->can('footprints');
        $canEstatesAccess = $this->can('estates-access');
        $canDiscovery     = $this->can('discovery');
        $canMyClients     = $this->can('manage-my-clients');
        $isEstatesDisabled = $this->state->getEstatesDisabled($this->company) === LotmixStateSettings::ESTATES_ACCESS_DISABLED;

        if ($canEstatesAccess) {
            return route('landspot.my-estates', [], false);
        } elseif ($canDiscovery) {
            if ($isEstatesDisabled) {
                if ($canMyClients) {
                    return route('my-clients.index', [], false);
                }
            }   else {
                return route('discovery', [], false);
            }
        }

        return $canFootprints ? config('app.FOOTPRINTS_URL') : '/';
    }

    /**
     * @return Estate
     */
    function estate()
    {
        return $this
            ->hasMany(Estate::class, 'state_id', 'state_id')
            ->where('published', '=', 1)
            ->where('approved', '=', 1);
    }

    /**
     * @return LotPackage|\Illuminate\Database\Eloquent\Relations\HasMany
     */
    function lotPackages()
    {
        return $this->hasMany(LotPackage::class, 'company_id', 'company_id');
    }

    /**
     * @param QueryBuilder $qb
     * @param string $tableAlias
     * @return QueryBuilder
     */
    protected function availableEstates(QueryBuilder $qb, $tableAlias = 'e')
    {
        return $qb
            ->where([
                $tableAlias . '.state_id'  => $this->state_id,
                $tableAlias . '.published' => 1,
                $tableAlias . '.approved'  => 1,
            ]);
    }

    function builderCompany()
    {
        return $this->company();
    }

    /**
     * @return array Company Ids
     */

    function getBuilderCompanies()
    {
        $company                 = $this->company->toArray();
        $result[$company['id']]  = $company;

        return $result;
    }

    /**
     * @param QueryBuilder $lotsQB
     * @param string $tableAlias
     */
    protected function applyUserFiltersForLotsCount(QueryBuilder $lotsQB, $tableAlias = 'estate_lots')
    {
        $companyID = $this->company_id;

        $lotsQB
            ->leftJoin('lots_visibility as lv', function (JoinClause $join) use ($companyID) {
                $join->on('l.id', '=', 'lv.lot_id')
                    ->on('lv.company_id', '=', \DB::raw((int) $companyID));
            })->where(function (QueryBuilder $b) {
                $b->where('l.visibility', '=', \DB::raw(Lot::visibility['all']), 'or');
                $b->whereRaw(\DB::raw('lv.company_id IS NOT NULL'), [], 'or');
            })
            ->where([
                $tableAlias . '.state_id'  => \DB::raw($this->state_id),
                $tableAlias . '.published' => \DB::raw(1),
                's.published'              => \DB::raw(1)
            ]);
    }
}
