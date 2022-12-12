<?php

namespace App\Repositories\Company;


use Illuminate\Database\Query\Builder as QueryBuilder;

/**
 * Interface CompanyInterface.
 *
 * @package namespace App\Repositories\Company\CompanyInterface;
 */
interface CompanyInterface
{
    /**
     * @param array $companyIds
     * @param array $filters
     * @param array $statesIds
     * @return QueryBuilder
     */
    function applyFiltersQB(array $companyIds, array $filters, array $statesIds): QueryBuilder;

}
