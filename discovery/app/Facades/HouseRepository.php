<?php

namespace App\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * Repository @see \App\Repositories\House\HouseRepository;
 *
 * @method static applyFilterAttributesEB($filters, $orderBy = null)
 */
class HouseRepository extends Facade
{
    protected static function getFacadeAccessor()
    {
        return 'house_repository';
    }
}