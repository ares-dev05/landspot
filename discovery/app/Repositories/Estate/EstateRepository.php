<?php

namespace App\Repositories\Estate;

use App\Models\Lot;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Facade;

/**
 * Class EstateRepository.
 *
 * @package namespace App\Repositories\Estate\EstateRepository;
 *
 * Facade @see \App\Facades\EstateRepository
 */
class EstateRepository extends Facade implements EstateInterface
{
    /**
     * Create filtered query builder query with for Estates
     *
     * @param array $filters
     * @return QueryBuilder
     */
    function createEstatesLotsCountQB(array $filters): QueryBuilder
    {
        $pdoConn = DB::connection()->getPdo();

        $estatesQB = DB::table('estates as e')
            ->select('e.id', 'e.name', 'e.thumb', 'e.small', 'e.path', 'e.geo_coords', 'e.published', 'e.approved', 'e.slug', 'e.logo', 'e.suburb');

        $v = $filters['estate_name'] ?? '';
        if ($v != '') {
            $estatesQB->where('e.name', 'like', DB::raw($pdoConn->quote("%{$v}%")));
        }

        $v = $filters['suburb'] ?? '';
        if ($v != '') {
            $estatesQB->where('e.suburb', 'like', DB::raw($pdoConn->quote("%{$v}%")));
        }

        $v = $filters['published'] ?? 0;
        if ($v > 0) {
            $estatesQB->where('e.published', '=', $v);
        }

        return $estatesQB;
    }

    /**
     * Create filtered query builder query for Estates with Lots
     *
     * @param array $filters
     * @return QueryBuilder
     */
    function createFilteredLotsCountQB(array $filters): QueryBuilder
    {
        $unsoldLots = $filters['unsold_lots'] ?? false;
        $lotmix = $filters['lotmix'] ?? false;

        $lotsQB = DB::table('estates as estate_lots')
            ->select('estate_lots.id', DB::raw('count(*) as lots_count'), DB::raw('GROUP_CONCAT(l.id) as lot_ids'))
            ->groupBy('estate_lots.id')
            ->join('stages as s', 's.estate_id', '=', 'estate_lots.id')
            ->join('lots as l', 'l.stage_id', '=', 's.id')
            ->where(function (QueryBuilder $b) use ($filters, $unsoldLots) {
                $pdoConn = DB::connection()->getPdo();

                $v = $filters['status'] ?? '';
                if ($v != '') {
                    $b->where('l.status', '=', DB::raw($pdoConn->quote($v)));
                }

                $v = $filters['width'] ?? 0;
                if ($v > 0) {
                    $b->where('l.frontage', '>=', DB::raw((float)$v));
                }

                $v = $filters['depth'] ?? 0;

                if ($v > 0) {
                    $b->where('l.depth', '>=', DB::raw((float)$v));
                }

                $v = $filters['area'] ?? 0;
                if ($v > 0) {
                    $b->where('l.area', '>=', DB::raw((float)$v));
                }

                $v = $filters['max_area'] ?? 0;
                if ($v > 0) {
                    $b->where('l.area', '<=', DB::raw((float)$v));
                }

                $price = $filters['min'] ?? 0;
                if ($price > 0) {
                    $b->where('l.price', '>=', DB::raw((float)$price));
                }

                $price = $filters['max'] ?? 0;
                if ($price > 0) {
                    $b->where('l.price', '<=', DB::raw((float)$price));
                }

                if ($unsoldLots) {
                    $b->where('l.status', '!=', DB::raw($pdoConn->quote('Sold')));
                    $b->where('l.status', '!=', DB::raw($pdoConn->quote('Deposit')));
                };

            });

        if ($unsoldLots) {
            $lotsQB->where('s.sold', DB::raw(0));
        }

        if ($lotmix) {
            $lotsQB->where('l.lotmix_visibility', DB::raw(Lot::lotmixVisibility['visible']));
        }

        $pdoConn = DB::connection()->getPdo();

        $v = $filters['estate_name'] ?? '';
        if ($v != '') {
            $lotsQB->where('estate_lots.name', 'like', DB::raw($pdoConn->quote("%{$v}%")));
        }
        $v = $filters['suburb'] ?? '';

        if ($v != '') {
            $lotsQB->where('estate_lots.suburb', 'like', DB::raw($pdoConn->quote("%{$v}%")));
        }

        return $lotsQB;
    }

    /**
     * Create filtered query builder query for Estates where has Lotmix Premium Features
     *
     * @param QueryBuilder $estatesQB
     * @param $feature
     * @return QueryBuilder
     */
    function filterByPremiumFeaturesQB(QueryBuilder $estatesQB, $feature): QueryBuilder
    {
        return $estatesQB->leftJoin('estate_premium_features as epf', 'epf.estate_id', '=', 'e.id')
            ->where('epf.type', $feature);
    }

    /**
     * Sets a default value for Estate lots if it is null
     *
     * @param QueryBuilder $estatesQB
     * @param QueryBuilder $lotsQB
     * @return QueryBuilder
     */
    function mergeColumnsAndLotsCountQB(QueryBuilder $estatesQB, QueryBuilder $lotsQB): QueryBuilder
    {
        return $estatesQB
            ->leftJoin(DB::raw('(' . $lotsQB->toSql() . ') as lc'), 'e.id', '=', 'lc.id')
            ->addSelect(
                DB::raw('lc.lots_count as lots_count'),
                DB::raw('lc.lot_ids as lot_ids')
            );
    }
}
