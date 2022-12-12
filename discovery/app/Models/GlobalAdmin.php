<?php

namespace App\Models;

use App\Models\Sitings\HasSitingTrait;
use Illuminate\Database\Query\Builder as QueryBuilder;

class GlobalAdmin extends User
{
    use BuilderCompaniesTrait, HasSitingTrait;

    function getBaseRoute()
    {
        return route('landspot.user-manager', [], false);
    }

    function getBuilderCompanies()
    {
        $items = Company::builderCompany()
            ->orderBy('name')
            ->get(['id', 'name', 'logo_path', 'type'])
            ->unique();

        $builderCompanies = $items->keyBy('id')->toArray();

        return $builderCompanies;
    }

    /**
     * @return Company
     */
    function builderCompany()
    {
        return Company::builderCompany();
    }

    function getUserCompanies($builderCompanies = false)
    {
        $companies = new Company;
        if ($builderCompanies) {
            $companies = $companies::builderCompany();
        }

        return $companies->get(['id', 'name', 'logo_path', 'type', 'chas_discovery', 'chas_estates_access'])->keyBy('id')->toArray();
    }

    function estate()
    {
        $relation = $this->hasMany(Estate::class);
        $q        = $relation->getBaseQuery();
        $q->wheres = [];
        $q->bindings['where'] = [];

        return $relation;
    }

    protected function availableEstates(QueryBuilder $qb, $tableAlias = 'e')
    {
        return $qb;
    }

    protected function applyUserFiltersForLotsCount(QueryBuilder $lotsQB, $tableAlias = 'estate_lots')
    {
        return $lotsQB;
    }
}
