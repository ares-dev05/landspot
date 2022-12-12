<?php

namespace App\Repositories\Company;

use Illuminate\Database\Query\Builder as QueryBuilder;

/**
 * Class CompanyRepository.
 *
 * @package namespace App\Repositories\Company\CompanyRepository;
 *
 * Facade @see \App\Facades\CompanyRepository
 */
class CompanyRepository implements CompanyInterface
{
    /**
     * @param array $companyIds
     * @param array $filters
     * @param array $statesIds
     * @return QueryBuilder
     */
    function applyFiltersQB(array $companyIds, array $filters, array $statesIds): QueryBuilder
    {
        $story = [];
        $width = $filters['width'] ?? 0;
        $depth = $filters['depth'] ?? 0;

        foreach ($filters as $key => $value) {
            if (($key == 'single' || $key == 'double') && $value) {
                $story[] = $value;
            }
        }

        return \DB::table("companies as c")
            ->whereIn('c.id', $companyIds)
            ->where('h.discovery', 1)
            ->join('house_ranges as r', 'r.cid', '=', 'c.id')
            ->join('houses as h', 'h.range_id', '=', 'r.id')
            ->join('house_attributes as a', 'a.house_id', '=', 'h.id')
            ->where(function (QueryBuilder $q) use ($filters, $story, $width, $depth) {

                $q->where(function (QueryBuilder $qPrices) use ($filters) {
                    $minPrice = (int)($filters['min'] ?? 0);
                    $maxPrice = (int)($filters['max'] ?? 0);

                    $qPrices->where(function (QueryBuilder $rangePrices) use ($minPrice, $maxPrice) {
                        if ($minPrice > 0) {
                            $rangePrices->where('a.price', '>=', $minPrice);
                        }

                        if ($maxPrice > 0) {
                            $rangePrices->where('a.price', '<=', $maxPrice);
                        }
                    });

                    if ($minPrice > 0 || $maxPrice > 0) {
                        $qPrices->orWhereNull('a.price');
                        $qPrices->orWhere('price', 0);
                    }
                });


                if (!empty($filters['bathrooms'])) {
                    $q->where('a.bathrooms', '=', $filters['bathrooms']);
                }
                if (!empty($filters['beds'])) {
                    $q->where('a.beds', '=', $filters['beds']);
                }
                if (!empty($filters['title'])) {
                    $q->where('h.title', 'like', str_replace(['%', '_'], ['\%', '\_'], $filters['title']) . '%');
                }
                if ($story) {
                    $q->whereIn('a.story', $story);
                }
                if ($width > 0) {
                    $q->where('a.width', '<=', $width);
                }
                if ($depth > 0) {
                    $q->where('a.depth', '<=', $depth);
                }
            })
            ->whereIn('r.state_id', $statesIds)
            ->whereNull('r.deleted_at');
    }
}
