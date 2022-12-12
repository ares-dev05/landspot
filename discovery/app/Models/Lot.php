<?php

namespace App\Models;

use App\Events\BrowserNotification;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Class Lot
 * @property int area
 * @property int id
 * @property int depth
 * @property int frontage
 * @property int lot_number
 * @property int packages
 * @property int price
 * @property int stage_id
 * @property int visibility
 * @property int lotmix_visibility
 * @property string geo_coords
 * @property string status
 * @property LotVisibility lotVisibility
 * @property LotPackage lotPackage
 * @property LotValues lotValues
 * @property LotDrawerData drawerData
 *
 * @method static Lot find(...$args)
 * @method map(\Closure $param)
 * @method each(\Closure $param)
 * @property Stage stage
 */
class Lot extends Model
{

    protected $fillable = [
        'stage_id', 'lot_number', 'geo_coords', 'frontage', 'depth',
        'area', 'status', 'price', 'title_date', 'visibility', 'packages',
        'lotmix_visibility'
    ];
    public $timestamps = false;

    const status = ['Available', 'Deposit', 'On Hold', 'Sold'];
    const visibility = ['disabled' => 0, 'partial' => 1, 'all' => 2];
    const lotmixVisibility = ['disabled' => 0, 'visible' => 1];

    const exportVisibility = [
        'all' => 0,
        'excluding_exclusives' => -1,
        'not_visible_to_builders' => -2,
        'visible_to_all_and_builder_company' => -3
    ];

    /* Relations */
    function stage()
    {
        return $this->belongsTo(Stage::class);
    }

    function drawerData()
    {
        return $this->hasOne(LotDrawerData::class);
    }

    public function lotValues()
    {
        return $this->hasMany(LotValues::class, 'lot_id', 'id');
    }

    function lotPackage()
    {
        return $this->hasMany(LotPackage::class, 'lot_id', 'id');
    }

    function lotVisibility()
    {
        return $this->hasMany(LotVisibility::class);
    }

    function scopeHasDrawerData(EloquentBuilder $b)
    {
        return $b->whereHas(
            'drawerData',
            function (EloquentBuilder $b) {
                $b->completed();
            }
        );
    }

    /**
     * @param EloquentBuilder $b
     * @param int $lotNumber
     * @return $this
     */
    function scopeByNumber(EloquentBuilder $b, $lotNumber)
    {
        return $b->where('lot_number', $lotNumber);
    }

    /* Events */
    static function boot()
    {
        parent::boot();
        static::creating(function (Lot $lot) {
            if (empty($lot->lot_number)) {
                $maxNumber = Lot::where('stage_id', $lot->stage_id)
                    ->select(DB::raw('max(`lot_number`) as m'))
                    ->get()
                    ->first()
                    ->toArray();
                $lot->lot_number = ++$maxNumber['m'];
            }

            if ($lot->visibility === null) $lot->visibility = static::visibility['all'];

            return true;
        });

        static::deleting(function (Lot $lot) {
            $lot->deleteLotPackages();

            $stage = $lot->stage;

            if ($stage->published) {
                $stage->estate()->touch();
            }

            $lot->drawerData()->delete();
        });

        static::saving(function (Lot $lot) {
            $stage = $lot->stage;

            if ($stage->published) {
                $stage->estate()->touch();
            }
        });

        static::saved(function (Lot $lot) {
            $lot->recalculateVisibility();

            if ($lot->stage->sold > 0 && $lot->status != 'Sold') {
                $lot->stage->update(['sold' => 0]);
            }

            $original = $lot->getOriginal();

            if ($lot->price != ($original['price'] ?? null)) {
                $lot->deleteLotPackages();
            }


            if ($original && $original['lotmix_visibility'] != $lot->lotmix_visibility &&
                $lot->lotmix_visibility == self::lotmixVisibility['disabled']) {
                $lot->shortlists()->delete();
            }
        });

        static::updating(function(Lot $lot){
            $user = auth()->user();
            $estate = $lot->stage->estate;
            $userCanUpdate = $user->estate->contains($estate) &&
                ($user->isLandDeveloper() ||
                    $user->isGlobalEstateManager() ||
                    ($estate->checkPermission(Permission::ListManager, $user->id) ||
                        $estate->checkPermission(Permission::PriceEditor, $user->id)));
            if(!$userCanUpdate){
                return false;
            }
            else{
                return 'bla';
            }
        });
    }

    protected function deleteLotPackages()
    {
        $lotPackages = $this->lotPackage->each(function (LotPackage $package) {
            $package->delete();
        });

        if ($lotPackages->isNotEmpty()) {
            $this->sendNotificationToBuilder();
        }
    }

    protected function sendNotificationToBuilder()
    {
        $estate = $this->stage->estate;
        $isActiveEstate = $estate->published && $estate->approved;

        if ($isActiveEstate) {
            $estate
                ->pdfManagers()
                ->each(function () use ($estate) {
                    try {
                        $notification = [
                            'title' => 'Pricing have been updated',
                            'icon' => $estate->thumbImage,
                            'onClickUrl' => $estate->publicUrl,
                            'text' => "The estate {$estate->name} has just updated their pricing"
                        ];
                        broadcast(new BrowserNotification($estate->getBrowserNotificationChannel('pdf-managers-'), $notification));
                    } catch (\Exception $e) {
                        logger()->info("Broadcast BrowserNotification event");
                        logger()->error($e->getMessage());
                    }
                });
        }
    }


    /* Scopes */
    /**
     * Exclude lots that are only visible to a specific builder company
     * @param EloquentBuilder $b
     * @param $exportVisibilityType
     * @param $builderCompanyId
     */
    function scopeVisibleToCompany(EloquentBuilder $b, $exportVisibilityType, $builderCompanyId)
    {
        if ($exportVisibilityType == static::exportVisibility['all']) return;

        switch ($exportVisibilityType) {
            case static::exportVisibility['excluding_exclusives']:
                $b->where(function (EloquentBuilder $q) {
                    $q->where('lots.visibility', '=', Lot::visibility['all'], 'or')/*
                        ->where('lots.visibility', '=', Lot::visibility['disabled'], 'or')*/
                    ;
                });
                break;

            case static::exportVisibility['not_visible_to_builders']:
                $b->where('lots.visibility', '=', Lot::visibility['disabled']);
                break;

            case static::exportVisibility['visible_to_all_and_builder_company']:
                $b->leftJoin('lots_visibility', function (JoinClause $join) use ($builderCompanyId) {
                    $join->on('lots.id', '=', 'lots_visibility.lot_id')
                        ->on('lots_visibility.company_id', '=', DB::raw((int)$builderCompanyId));
                })->where(function (EloquentBuilder $q) {
                    $q->where('lots.visibility', '=', Lot::visibility['all'], 'or')
                        ->whereRaw('lots_visibility.company_id IS NOT NULL', [], 'or');
                });
                break;

            default:
                $b->join('lots_visibility', function (JoinClause $join) use ($builderCompanyId) {
                    $join->on('lots.id', '=', 'lots_visibility.lot_id')
                        ->on('lots_visibility.company_id', '=', DB::raw((int)$builderCompanyId));
                });
        }
    }

    /**
     * @param EloquentBuilder $b
     */
    function scopeUnsoldOnly(EloquentBuilder $b)
    {
        $b->where('status', 'Available');
    }

    function scopeStaticColumns(EloquentBuilder $b)
    {
        $b->where('column_type', 'static');
    }

    /**
     * @return \Illuminate\Database\Query\Builder
     */
    static function getDistinctAttributesQB()
    {
        return
            DB::table(DB::raw('lots as l'))
                ->select('l.status', 'l.price')
                ->join('stages as s', 'l.stage_id', '=', 's.id')
                ->join('estates as e', 's.estate_id', '=', 'e.id')
                ->groupBy('l.status', 'l.price');
    }

    /**
     * @param array $filters
     * @param Collection $columns
     * @return Collection
     */
    static function getFilteredCollection(array $filters, Collection $columns)
    {
        $conn = DB::connection()->getDoctrineConnection();
        $pdoConn = DB::connection()->getPdo();

        $items = DB::table(DB::raw('lots as l'))
            ->join('stages as s', 'l.stage_id', '=', 's.id')
            ->addSelect(
                'l.id',
                DB::raw('l.visibility as lot_visibility'),
                DB::raw('l.lotmix_visibility AS lotmix_visibility'),
                DB::raw('CAST(ifnull(lp.lot_package, 0) as SIGNED) AS lot_packages'),
                DB::raw('CAST(ifnull(ld.drawer_data, 0) as SIGNED) AS drawer_data'),
                'ld.lot_image as lot_image',
                'rotation'
            );

        $items->leftJoin(
            DB::raw(
                "(SELECT lot_id, min(id) as drawer_data, path as lot_image, rotation
                  FROM lot_drawer_data
                  WHERE is_completed = 1
                  GROUP BY lot_id, path, rotation ) AS ld"
            ),
            'ld.lot_id', '=', 'l.id'
        );

        if (isset($filters['lotmix'])) {
            $items->where('l.lotmix_visibility', '=', static::lotmixVisibility['visible']);
        }

        if (!empty($filters['builder_company'])) {
            //get lot packages only for builders
            $companyId = $pdoConn->quote($filters['builder_company']);
            $items->leftJoin(
                DB::raw(
                    "(SELECT lot_id, min(id) as lot_package
                      FROM lot_packages WHERE company_id = $companyId
                      GROUP BY lot_id ) AS lp"
                ),
                'lp.lot_id', '=', 'l.id'
            );
        } else {
            $items->leftJoin(
                DB::raw(
                    "(SELECT lot_id, min(id) as lot_package
                      FROM lot_packages
                      GROUP BY lot_id ) AS lp"
                ),
                'lp.lot_id', '=', 'l.id'
            );
        }

        $tableIndex = 0;
        foreach ($columns as $column) {
            $columnName = $conn->quoteIdentifier($column->attr_name);
            $dynamicColumnID = $pdoConn->quote('v' . $column->id);
            $items->addSelect(
                $column->column_type == 'static'
                    ? DB::raw("l.{$columnName}")
                    : DB::raw("v{$tableIndex}.value as {$dynamicColumnID}")
            );
            if ($column->column_type != 'static') {
                $items->leftJoin(DB::raw("lot_values as v{$tableIndex}"),
                    function (JoinClause $join) use ($tableIndex, $column, $pdoConn) {
                        $join->on(DB::raw("v{$tableIndex}.lot_id"), '=', DB::raw('l.id'))
                            ->on(DB::raw("v{$tableIndex}.lot_attr_id"), '=', DB::raw($pdoConn->quote($column->id)));
                    });
                $tableIndex++;
            }
        }

        $items->where(function (QueryBuilder $b) use ($filters) {

            $b->where('s.estate_id', '=', $filters['estate_id']);

            if (isset($filters['area']) && $filters['area'] != 0) {
                $b->where('l.area', '>=', $filters['area']);
            }

            if (isset($filters['max_area']) && $filters['max_area'] != 0) {
                $b->where('l.area', '<=', $filters['max_area']);
            }

            if (isset($filters['stage_id'])) {
                $b->where('l.stage_id', '=', $filters['stage_id']);
            }

            if (isset($filters['status'])) {
                $b->where('l.status', '=', $filters['status']);
            }

            if (!empty($filters['width']) && !empty($filters['width']) && (float)$filters['width'] > 0) {
                $b->where('l.frontage', '>=', (float)$filters['width']);
            }

            if (!empty($filters['depth']) && !empty($filters['depth']) && (float)$filters['depth'] > 0) {
                $b->where('l.depth', '>=', (float)$filters['depth']);
            }

            if (!empty($filters['min']) && !empty($filters['min']) && (float)$filters['min'] > 0) {
                $b->where('l.price', '>=', (float)$filters['min']);
            }

            if (!empty($filters['max']) && !empty($filters['max']) && (float)$filters['max'] > 0) {
                $b->where('l.price', '<=', (float)$filters['max']);
            }

            if (!empty($filters['unsold_lots'])) {
                $b->where('l.status', '<>', 'Sold');
            }
        });

        if (!empty($filters['builder_company'])) {
            $items->where(function (QueryBuilder $b) use ($filters) {
                $b->where('l.visibility', '=', Lot::visibility['all'], 'or');
                $b->whereRaw(DB::raw('lv.company_id IS NOT NULL'), [], 'or');
            });

            $items->leftJoin('lots_visibility as lv', function (JoinClause $join) use ($filters) {
                $join->on('lv.company_id', '=', DB::raw((int)$filters['builder_company']));
                $join->on('l.id', '=', 'lv.lot_id');
            });
        }

        $orderbyColumnIndex = $filters['order'] ?? 0;
        $direction = $filters['order_type'] ?? 'asc';
        if ($direction !== 'asc' && $direction !== 'desc') $direction = 'asc';

        if ($columns->contains('order', $orderbyColumnIndex)) {
            $orderbyColumn = $columns->where('order', $orderbyColumnIndex)->first();
            if ($orderbyColumn->column_type == 'static') {
                $orderBy = $orderbyColumn->attr_name === 'frontage' || $orderbyColumn->attr_name === 'lot_number'
                    ? DB::raw('CAST(`l`.' . $conn->quoteIdentifier($orderbyColumn->attr_name) . ' AS UNSIGNED)')
                    : DB::raw('l.' . $conn->quoteIdentifier($orderbyColumn->attr_name));
                $items->orderBy($orderBy,$direction);
            } else {
                $items->orderBy('v' . $orderbyColumn->id, $direction);
            }
        }

        return $items->get();
    }


    /**
     * @param $stateIds
     * @param string $tableAlias
     * @return Collection
     */
    static function getDistinctLotByPublishedApprovedEstate($stateIds, $tableAlias = 'e'): Collection
    {
        $qb = self::getDistinctAttributesQB();

        return $qb
            ->where([
                $tableAlias . '.published' => DB::raw(1),
                $tableAlias . '.approved' => DB::raw(1),
            ])
            ->whereIntegerInRaw($tableAlias . '.state_id', $stateIds)
            ->get();
    }


    function recalculateVisibility()
    {
        if (
            $this->visibility == static::visibility['all'] ||
            $this->visibility == static::visibility['disabled']) {
            $this->lotVisibility()->delete();
        }
    }

    function shortlists()
    {
        return $this->hasMany(ShortList::class, 'lot_id', 'id');
    }

    function setStatusAttribute($v)
    {
        if (in_array($v, self::status)) {
            $this->attributes['status'] = $v;
        }
    }

    /**
     * @return string|null
     */
    function getLotImageAttribute()
    {
        return $this->drawerData ? $this->drawerData->lotImage : null;
    }

    /**
     * @return string|null
     */
    function getDrawerThemeAttribute()
    {
        return $this->stage ? $this->stage->drawerTheme : null;
    }
}
