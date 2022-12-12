<?php

namespace App\Repositories\House;


use Illuminate\Database\Eloquent\Builder as EloquentBuilder;

/**
 * Interface HouseInterface.
 *
 * @package namespace App\Repositories\House\HouseInterface;
 */
interface HouseInterface
{
    /**
     * Create filtered eloquent builder query with attributes for Houses
     *
     * @param array $filters
     * @param $orderBy
     * @return EloquentBuilder
     */
    function applyFilterAttributesEB(array $filters, $orderBy): EloquentBuilder;
}
