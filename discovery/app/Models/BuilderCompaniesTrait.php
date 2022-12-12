<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
/**
 * Trait BuilderCompaniesTrait (for Land Developer and Estate manager)
 */

trait BuilderCompaniesTrait
{
    /**
     * @return \Illuminate\Database\Eloquent\Collection
     */
    function getStatesList()
    {
        return $this
            ->estate()
            ->distinct()
            ->get(['state_id'])
            ->pluck('state_id')
            ->unique();
    }

    /**
     * @return array Company Ids
     */
    function getBuilderCompanies()
    {
        $statesList       = $this->getStatesList();
        $builderCompanies = [];
        if ($statesList) {
            $items = Company::builderCompaniesInState($statesList)
                ->hasDiscovery()
                ->hasEstatesAccess()
                ->orderBy(\DB::raw('RAND()'))
                ->get(['id', 'name', 'logo_path', 'type'])
                ->unique();

            $builderCompanies = $items->keyBy('id')->toArray();
        }

        return $builderCompanies;
    }

    /**
     * @return Company
     */
    function builderCompany()
    {
        return Company::whereIn('id', array_keys($this->getBuilderCompanies()));
    }
}
