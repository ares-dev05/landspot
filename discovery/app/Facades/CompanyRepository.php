<?php

namespace App\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * Repository @see \App\Repositories\Company\CompanyRepository;
 *
 * @method static applyFiltersQB(array $companiesIds, array $filters, array $statesIds)
 */
class CompanyRepository extends Facade
{
    protected static function getFacadeAccessor()
    {
        return 'company_repository';
    }
}