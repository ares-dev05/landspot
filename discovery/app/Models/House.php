<?php

namespace App\Models;

use App\Facades\CompanyRepository;
use App\Facades\HouseRepository;
use App\Models\Sitings\Siting;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use MathHelper;

/**
 * Class House
 * @package App
 *
 * @method static House findOrFail($id)
 * @method static House find($id)
 * @method static House create($args)
 * @method static Builder select($args)
 * @property int id
 * @property int discovery
 * @property int house_svgs_id
 * @property int range_id
 * @property string title
 * @property Facade facades
 * @property Siting siting
 * @property Floorplan floorplans
 * @property Gallery gallery
 * @property HouseAttributes attributes
 * @property Option options
 * @property Range range
 * @property Volume volume
 * @property Company company
 * @method static byState(State $state)
 * @method static byRangesIds(Collection $ranges)
 * @method static byDiscovery(string $value)
 * @method static firstOrCreate(array $array, int[] $array1)
 */
class House extends Model
{
    use WithAndWhereHasTrait;

    protected $fillable = [
        'house_svgs_id', 'range_id', 'discovery', 'title'
    ];

    protected $appends = ['beds', 'bathrooms', 'cars', 'image'];
    protected $hidden = ['house_svgs_id', 'range_id', 'created_at', 'parsed_at', 'updated_at'];

    public $randomFacadeImage = false;

    const DISCOVERY_DISABLE = 0;
    const DISCOVERY_ENABLE = 1;


    /*========================================EVENTS========================================*/


    protected static function boot()
    {
        parent::boot();
        static::deleting(function (House $house) {
            $house->deleteChildItems();
        });

        static::saved(function (House $house) {
            $original = $house->getOriginal();

            if ($original && $original['discovery'] != $house->discovery &&
                $house->discovery == self::DISCOVERY_DISABLE) {
                $house->floorplanShortLists()->delete();
            }
        });
    }


    /*========================================RELATIONS========================================*/


    public function attributes()
    {
        return $this->hasOne(HouseAttributes::class);
    }

    public function facades()
    {
        return $this->hasMany(Facade::class);
    }

    public function options()
    {
        return $this->hasMany(Option::class);
    }

    public function gallery()
    {
        return $this->hasMany(Gallery::class);
    }

    public function floorplans()
    {
        return $this->hasMany(Floorplan::class);
    }

    public function volume()
    {
        return $this->hasOne(Volume::class);
    }

    public function range()
    {
        return $this->belongsTo(Range::class, 'range_id', 'id');
    }

    public function state()
    {
        return $this->hasOneThrough(State::class, Range::class, 'id', 'id', 'range_id', 'state_id');
    }

    /**
     * Get the company.
     */
    public function company()
    {
        return $this->hasOneThrough(Company::class, Range::class, 'id', 'id', 'range_id', 'cid');
    }

    function siting()
    {
        return $this->hasOne(Siting::class, 'house_svgs_id', 'house_svgs_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    function floorplanShortLists()
    {
        return $this->hasMany(FloorplanShortList::class);
    }


    /*========================================ATTRIBUTES========================================*/


    public function getPriceAttribute()
    {
        return optional($this->attributes()->first())->price;
    }

    public function getImageAttribute()
    {
        $path = optional(
            $this->randomFacadeImage
                ? ($this->facades->count() ? $this->facades->random() : null)
                : $this->facades->first()

        )->smallImage;

        return $path ? asset($path) : asset('img/thumb-example.jpg', true);
    }

    public function getBedsAttribute()
    {
        return optional($this->attributes()->first())->beds;
    }

    public function getCarsAttribute()
    {
        return optional($this->attributes()->first())->cars;
    }

    public function getDescriptionAttribute()
    {
        return optional($this->attributes()->first())->description;
    }

    public function getWidthAttribute()
    {
        return optional($this->attributes()->first())->width;
    }

    public function getDepthAttribute()
    {
        return optional($this->attributes()->first())->depth;
    }

    public function getBathroomsAttribute()
    {
        return optional($this->attributes()->first())->bathrooms;
    }

    public function getAreaSizeAttribute()
    {
        return optional($this->attributes()->first())->areaSize;
    }

    public function getAreaSizeUnitsAttribute()
    {
        return optional($this->attributes()->first())->size_units;
    }

    public function getStoryAttribute()
    {
        return optional($this->attributes()->first())->story;
    }


    /*========================================SCOPES========================================*/


    /**
     * @param EloquentBuilder $b
     * @param string $title
     * @return EloquentBuilder
     */
    function scopeByName(EloquentBuilder $b, $title)
    {
        return $b->where('title', 'like', $title);
    }

    /**
     * @param EloquentBuilder $b
     * @param State $state
     * @return EloquentBuilder
     */
    function scopeByState(EloquentBuilder $b, State $state)
    {
        return $b->whereHas('state', function ($b) use ($state) {
            $b->where('house_states.id', $state->id);
        });
    }

    /**
     * @param EloquentBuilder $b
     * @param string $value
     * @return EloquentBuilder
     */
    function scopeByDiscovery(EloquentBuilder $b, string $value)
    {
        return $b->where('discovery', $value);
    }

    /**
     * @param EloquentBuilder $b
     * @param Collection $rangeIds
     * @return EloquentBuilder
     */
    function scopeByRangesIds(EloquentBuilder $b, Collection $rangeIds)
    {
        return $b->whereIn('range_id', $rangeIds);
    }


    /*========================================FUNCTIONS========================================*/


    function deleteChildItems()
    {
        $this->facades()->each(function (Facade $o) {
            $o->updateHouseDiscoveryOnDelete = false;
            $o->delete();
        });

        $this->floorplans()->each(function (Floorplan $o) {
            $o->updateHouseDiscoveryOnDelete = false;
            $o->delete();
        });

        $this->gallery()->each(function (Gallery $o) {
            $o->updateHouseDiscoveryOnDelete = false;
            $o->delete();
        });

        $this->options()->each(function (Option $o) {
            $o->updateHouseDiscoveryOnDelete = false;
            $o->delete();
        });

        $this->volume()->each(function (Volume $o) {
            $o->updateHouseDiscoveryOnDelete = false;
            $o->delete();
        });
    }

    /**
     * @return array|string[]
     */
    function listIncompletedAttributes()
    {
        $items = [];
        $required = [
            'bathrooms', 'beds', /*'cars',*/
            'depth', /*'description', 'price',*/
            'size', 'story', 'width',
        ];
        $attributes = optional($this->attributes())->first();
        if ($attributes) {
            $completed = collect($attributes)->filter(function ($value, $key) use ($required) {
                if (!in_array($key, $required)) {
                    return false;
                }

                return
                    is_null($value) ||
                    $value === '' ||
                    is_int($value) && $value < 0 ||
                    $key === 'price' && $value <= 0;
            });

            foreach ($completed as $key => $value) {
                $items[] = ucfirst($key);
            }
        } else {
            $items = ['all attributes'];
        }

        if (!$this->facades()->exists()) {
            $items[] = 'Facade';
        }

        if (!$this->floorplans()->exists()) {
            $items[] = 'Floorplan';
        }

        //        if (!$this->gallery()->exists()) {
        //            $items[] = 'Gallery';
        //        }

        return $items;
    }

    /**
     * @param int $paginate
     * @param null $range
     * @param null $order
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getCollection($paginate = 0, $range = null, $order = null)
    {
        $houseTable = (new self())->getTable();
        $rangesTable = (new Range())->getTable();

        $houses = House::select($houseTable . '.*', 'r.id as rid', 'r.name as rangeName')
            ->join($rangesTable . ' as r', 'r.id', '=', $houseTable . '.range_id')
            ->where(['state_id' => Auth::user()->state_id, 'cid' => Auth::user()->company_id])
            ->whereNull('r.deleted_at');

        if (!empty($range)) {
            $houses->where("$houseTable.range_id", $range);
        }
        if (!empty($order)) {
            $houses->orderBy("$houseTable.title", $order);
        } else {
            $houses->orderBy("$houseTable.id", 'desc');
        }

        return $paginate ? $houses->paginate($paginate) : $houses->get();
    }

    /**
     * @param $filters
     * @param string[] $columns
     * @param int $page
     * @param null $orderBy
     * @return LengthAwarePaginator|\Illuminate\Database\Eloquent\Collection
     */
    public static function getFilteredCollection($filters, $columns = ['*'], $page = 0, $orderBy = null)
    {
        $collection = HouseRepository::applyFilterAttributesEB($filters, $orderBy);

        return $page ? $collection->paginate(60, $columns) : $collection->get($columns);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection
     */
    static function migrateExistingHouses()
    {
        $housesSvgs = HouseSvgs::getCollection();
        $houses = House::getCollection();

        $diffNames = $housesSvgs->pluck('name')->diff($houses->pluck('title'));

        $results = $housesSvgs->whereIn('name', $diffNames);

        foreach ($results as $result) {

            $house = House::create([
                'house_svgs_id' => $result->id,
                'range_id' => $result->range_id,
                'title' => $result->name
            ]);

            $json = json_decode($result->area_data);

            if (json_last_error() === JSON_ERROR_NONE && is_object($json)) {
                foreach ($json->area as $key => $item) {
                    $title = ucwords(str_replace('_', ' ', $key));
                    if (strpos($title, 'Facade') !== false) {
                        $house->facades()->create([
                            'house_id' => $house->id, 'title' => $title
                        ]);
                    } elseif (strpos($title, 'Option') !== false) {
                        $house->options()->create([
                            'house_id' => $house->id, 'title' => $title
                        ]);
                    }
                }
            }
        }

        return House::getCollection();
    }

    /**
     * @param false $returnHouses
     * @return array
     */
    static function addNewHousesFromSVG($returnHouses = false)
    {
        $housesTable = (new self())->getTable();
        $housesSVGtable = (new HouseSvgs())->getTable();
        $rangesTable = (new Range())->getTable();
        $items = DB::table($housesSVGtable . ' as s')
            ->leftJoin($housesTable . ' as h', 's.id', '=', 'h.house_svgs_id')
            ->leftJoin($rangesTable . ' as r', 'r.old_range_id', '=', 's.range_id')
            ->select('s.id', 's.name', 's.range_id', 's.area_data', 'r.id as new_range_id')
            ->whereRaw('h.house_svgs_id is NULL')
            ->get();

        $houses = [];
        foreach ($items as $item) {
            $house = House::create([
                'house_svgs_id' => $item->id,
                'range_id' => $item->new_range_id,
                'title' => $item->name
            ]);

            self::parseAreaData($house, $item->area_data);
            if ($returnHouses) $houses[] = $house;
        }

        return $houses;
    }

    /**
     * @param House $house
     * @param $areaData
     */
    protected static function parseAreaData(House &$house, $areaData)
    {
        $json = json_decode($areaData);
        if (json_last_error() === JSON_ERROR_NONE && is_object($json)) {
            $floorPlanSizes = [];
            $floorPlanSize = 0;
            foreach ($json->area as $key => $value) {
                $title = ucwords(str_replace('_', ' ', $key));
                if (strpos($title, 'Facade') !== false) {
                    foreach ($value as $attribute) {
                        if (is_int($attribute) || is_float($attribute)) {
                            $floorPlanSize += $attribute;
                        }
                    }
                    $house->facades()->create([
                        'house_id' => $house->id, 'title' => $title
                    ]);
                } elseif (strpos($title, 'Option') !== false) {
                    $house->options()->create([
                        'house_id' => $house->id, 'title' => $title
                    ]);
                }
                $floorPlanSizes[] = $floorPlanSize;
            }

            if ($floorPlanSizes) {
                $floorPlanSize = min($floorPlanSizes);
                if ($floorPlanSize > 0) {
                    $house->floorplans()->updateOrCreate([], ['size' => $floorPlanSize]);
                }
            }
        }
    }

    static function updateUpdatedHouses()
    {
        $housesTable = (new self())->getTable();
        $housesSVGtable = (new HouseSvgs())->getTable();
        $items = DB::table($housesTable . ' as h')
            ->join($housesSVGtable . ' as s', 's.id', '=', 'h.house_svgs_id')
            ->whereRaw('s.updated_at > h.parsed_at')
            ->select('s.*', 'h.id as house_id')
            ->get();

        $houses = [];

        foreach ($items as $item) {
            $house = House::findOrFail($item->house_id);
            $house->attributes()->delete();

            $house->deleteChildItems();

            $house->parsed_at = $item->updated_at;
            $house->save();
            self::parseAreaData($house, $item->area_data);
            $houses[] = $house;
        }

        return $houses;
    }

    static function deleteRemovedHouses()
    {
        $housesTable = (new self())->getTable();
        $housesSVGtable = (new HouseSvgs())->getTable();
        $ids = DB::table($housesTable . ' as h')
            ->leftJoin($housesSVGtable . ' as s', 'h.house_svgs_id', '=', 's.id')
            ->select('h.id')
            ->whereRaw('s.id is NULL')
            ->pluck('id')
            ->toArray();

        foreach ($ids as $id) {
            $house = new self($id);
            $house->delete();
        }
        //House::destroy($ids);
    }

    static function jobManageHouses()
    {
        //The discovery list should be generated from scratch
        //        self::addNewHousesFromSVG();
        //        self::deleteRemovedHouses();
        //        self::updateUpdatedHouses();
    }

    static function jobRemoveIncompletedHousesFromDiscovery()
    {
        foreach (self::all() as $house) {
            $house->validateDiscoveryMode();
        }
    }

    protected function validateDiscoveryMode()
    {
        if ($this->discovery && $this->listIncompletedAttributes()) {
            $this->discovery = 0;
            $this->save();
        }
    }

    static function onDeleted($house_id)
    {
        $house = self::find($house_id);
        if ($house) {
            $house->validateDiscoveryMode();
        }
    }

    /**
     * @param array $companiesIds
     * @param array $filters
     * @param array $statesList
     * @return \Illuminate\Support\Collection
     */
    static function countAvailableHouses(array $companiesIds, array $filters, array $statesList)
    {
        return CompanyRepository::applyFiltersQB($companiesIds, $filters, $statesList)
            ->select('c.id', \DB::raw('count(*) houses_count'))
            ->groupBy('c.id')
            ->get();
    }

    /**
     * @param array $companiesIds
     * @param array $filters
     * @param array $statesList
     * @return array
     */
    static function getHouseDistinctParameters(array $companiesIds, array $filters, array $statesList)
    {
        $price = CompanyRepository::applyFiltersQB($companiesIds, $filters, $statesList)
            ->select(\DB::raw('min(price) as min, max(price) as max'))
            ->distinct()
            ->get()
            ->first();

        $price->max = $price->max
            ? MathHelper::roundUpToIncrement((int)$price->max)
            : 0;
        $price->min = $price->min
            ? MathHelper::roundDownToIncrement((int)$price->min)
            : 0;

        $attributes = CompanyRepository::applyFiltersQB($companiesIds, $filters, $statesList)
            ->select(\DB::raw('beds, bathrooms'))
            ->distinct()
            ->get();

        $beds = $attributes
            ->unique('beds')
            ->sortBy('beds')
            ->pluck('beds')
            ->filter(function ($value) {
                return $value > 0;
            })
            ->values();

        $bathrooms = $attributes
            ->unique('bathrooms')
            ->sortBy('bathrooms')
            ->pluck('bathrooms')
            ->filter(function ($value) {
                return $value > 0;
            })
            ->values();

        return compact('price', 'beds', 'bathrooms');
    }
}
