<?php

namespace App\Models;

use App\Models\Sitings\HasSitingTrait;
use Illuminate\Database\Query\Builder as QueryBuilder;

/**
 * Class EstateManager
 * @method static EstateManager getUser()
 */
class EstateManager extends User
{
    use BuilderCompaniesTrait, EstatePremiumFeaturesTrait, HasSitingTrait;

    function estate()
    {
        return $this->belongsToMany(Estate::class, 'estate_managers', 'manager_id');
    }

    /**
     * @param QueryBuilder $qb
     * @param string $tableAlias
     * @return QueryBuilder
     */
    protected function availableEstates(QueryBuilder $qb, $tableAlias = 'e')
    {
        return $qb
            ->join('estate_managers as em', 'em.estate_id', '=', $tableAlias . '.id')
            ->where('em.manager_id', \DB::raw($this->id));
    }

    protected function applyUserFiltersForLotsCount(QueryBuilder $lotsQB, $tableAlias = 'estate_lots')
    {
        $this->availableEstates($lotsQB, $tableAlias);
    }
}
