<?php

namespace App\Repositories\Estate;

use Illuminate\Database\Query\Builder as QueryBuilder;

/**
 * Interface EstateInterface.
 *
 * @package namespace App\Repositories\Estate\EstateInterface;
 */
interface EstateInterface
{
    /**
     * Create filtered query builder query with for Estates
     *
     * @param array $filters
     * @return QueryBuilder
     */
    function createEstatesLotsCountQB(array $filters): QueryBuilder;

    /**
     * Create filtered query builder query for Estates with Lots
     *
     * @param array $filters
     * @return QueryBuilder
     */
    function createFilteredLotsCountQB(array $filters): QueryBuilder;

    /**
     * Create filtered query builder query for Estates where has Lotmix Premium Features
     *
     * @param QueryBuilder $estatesQB
     * @param $feature
     * @return QueryBuilder
     */
    function filterByPremiumFeaturesQB(QueryBuilder $estatesQB, $feature): QueryBuilder;

    /**
     * Sets a default value for Estate lots if it is null
     *
     * @param QueryBuilder $estatesQB
     * @param QueryBuilder $lotsQB
     * @return QueryBuilder
     */
    function mergeColumnsAndLotsCountQB(QueryBuilder $estatesQB, QueryBuilder $lotsQB): QueryBuilder;
}
