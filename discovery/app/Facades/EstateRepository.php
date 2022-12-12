<?php

namespace App\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * Repository @see \App\Repositories\Estate\EstateRepository;
 *
 * @method static createEstatesLotsCountQB(array $filters)
 * @method static createFilteredLotsCountQB(array $filters)
 * @method static filterByPremiumFeaturesQB($estatesQB, string $feature)
 * @method static mergeColumnsAndLotsCountQB($estatesQB, $estatesWithLotsQB)
 *
 */
class EstateRepository extends Facade
{
    protected static function getFacadeAccessor()
    {
        return 'estate_repository';
    }
}