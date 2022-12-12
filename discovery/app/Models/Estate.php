<?php

namespace App\Models;

use App\Events\EstateApproved;
use App\Facades\EstateRepository;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use \Illuminate\Database\Query\Builder as QueryBuilder;
use \Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use MathHelper;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

/**
 * Class Estate
 * @property int approved
 * @property int company_id
 * @property int id
 * @property int published
 * @property int lotmix_public
 * @property int state_id
 * @property string suburb
 * @property int confirmed_at
 * @property int updated_at
 * @property int created_at
 * @property string address
 * @property string contacts
 * @property string geo_coords
 * @property string name
 * @property string description
 * @property string description_secondary
 * @property string path
 * @property string small
 * @property string thumb
 * @property string website
 * @property string slug
 * @property string suburb_slug
 * @property string message
 * @property Range range
 * @property Stage stage
 * @property State state
 * @property Collection lots
 * @property Collection estateLots
 * @property PDFLotsTemplate pdfLotsTemplate
 * @property Company company
 * @property Collection estateManager
 * @property EstateShortList estateShortLists
 * @property EstateAmenity estateAmenities
 * @property EstateSnapshot estateSnapshots
 * @property EstateGallery estateGallery
 * @property EstatePremiumFeatures premiumFeatures
 *
 * @property string thumbImage
 * @property string smallImage
 * @property string publicUrl
 * @property object sortEstateAmenities
 * @property string logo
 *
 * @method static findOrFail($id)
 * @method static approved()
 * @method static lotmixPublic()
 * @method static publishedApproved()
 * @method static byState(State $state)
 * @method static byNameLike(string $name)
 * @method static bySuburb()
 * @method static where(...$args)
 * @method static find($ids)
 */
class Estate extends Model
{
    use ResizeImageTrait, HasBrowserNotificationsTrait, HasSlug;

    protected static $storageFolder = 'estate';

    function __construct(array $attributes = [])
    {
        self::$imageSizes = ['thumb', 'small'];

        return parent::__construct(...func_get_args());
    }

    protected $dateFormat = 'U';

    protected $fillable = [
        'company_id', 'name', 'description', 'description_secondary', 'description_suburb', 'state_id', 'suburb', 'path', 'thumb', 'small',
        'address', 'contacts', 'website', 'published', 'lotmix_public', 'geo_coords', 'approved',
        'confirmed_at', 'updated_at', 'created_at', 'message', 'region_id'
    ];
    protected $appends = ['thumbImage', 'smallImage'];

    protected $hidden = ['company_id', 'state_id', 'thumb', 'small', 'path', /*'confirmed_at',*/
        /*'updated_at', */
        'created_at'];

    const staticLotColumns = [
        'lot_number' => 'Lot No',
        'frontage' => 'Front (m)',
        'depth' => 'Depth (m)',
        'area' => 'Area (m2)',
        'title_date' => 'Title Date',
        'price' => 'Price',
        'status' => 'Status',
    ];


    public static function boot()
    {
        parent::boot();
        static::created(function (Estate $item) {
            $order = 0;
            foreach (Estate::staticLotColumns as $name => $value) {
                $item->lotAttributes()->create([
                    'attr_name' => $name,
                    'display_name' => $value,
                    'order' => $order++,
                    'column_type' => 'static'
                ]);
            }

            return true;
        });

        static::deleting(function (Estate $e) {
            $e->stage()->each(function (Stage $s) {
                $s->delete();
            });
        });

        static::updated(function (Estate $e) {
            if ($e->getAttributeFromArray('approved') == 1 &&
                ($e->getOriginal('approved') === 0 || $e->getOriginal('approved') === '0')
            ) {
                event(new EstateApproved($e));
            }
            if ($e->published != $e->getOriginal('published')) {
                Artisan::queue('sitemap:generate');
            }
        });
    }

    public $timestamps = false;


    /*========================================RELATIONS========================================*/


    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function estateManager()
    {
        return $this->belongsToMany(EstateManager::class, 'estate_managers', 'estate_id', 'manager_id');
    }

    public function lotAttributes()
    {
        return $this->hasMany(LotAttributes::class);
    }

    public function estateGallery()
    {
        return $this->hasMany(EstateGallery::class);
    }

    public function estateAmenities()
    {
        return $this->hasMany(EstateAmenity::class);
    }

    public function estateSnapshots()
    {
        return $this->hasMany(EstateSnapshot::class);
    }

    public function estateFaq()
    {
        return $this->hasMany(EstateFaq::class);
    }

    public function estateLots()
    {
        return $this->hasManyThrough(Lot::class, Stage::class, 'estate_id', 'stage_id', 'id', 'id');
    }

    public function managerPermissions()
    {
        return $this->hasManyThrough(Permission::class, EstateManagerPermission::class, 'estate_id', 'id', 'id', 'permission_id');
    }

    public function estatePermissions()
    {
        return $this->belongsToMany(Permission::class, 'estate_manager_permissions', 'estate_id', 'permission_id');
    }

    public function pdfManagers()
    {
        return $this->belongsToMany(PdfManager::class, 'pdf_managers', 'estate_id', 'manager_id');
    }

    public function houseState()
    {
        return $this->belongsTo(HouseState::class, 'state_id');
    }

    function range()
    {
        return $this->belongsTo(Range::class, 'state_id', 'state_id');
    }

    function stage()
    {
        return $this->hasMany(Stage::class);
    }

    function lots()
    {
        return $this->hasManyThrough(Lot::class, Stage::class);
    }

    function pdfLotsTemplate()
    {
        return $this->hasOne(PDFLotsTemplate::class);
    }

    function premiumFeatures()
    {
        return $this->hasMany(EstatePremiumFeatures::class, 'estate_id');
    }

    function shortLists()
    {
        return $this->hasManyThrough(ShortList::class, EstateShortList::class, 'estate_id', 'estate_short_list_id', 'id', 'id');
    }

    function estateShortLists()
    {
        return $this->hasMany(EstateShortList::class);
    }

    public function brief()
    {
        return $this->belongsTo(Brief::class);
    }

    public function formulaValue()
    {
        return $this->morphMany(FormulaValue::class, 'reference');
    }


    /*========================================SCOPES========================================*/


    function scopePublishedApproved(EloquentBuilder $b)
    {
        return $b->where([
            'published' => 1,
            'approved' => 1
        ]);
    }

    function scopeApproved(EloquentBuilder $b)
    {
        return $b->where('approved', 1);
    }

    function scopeLotmixPublic(EloquentBuilder $b)
    {
        return $b->where('lotmix_public', 1);
    }

    function scopeByNameLike(EloquentBuilder $b, $name)
    {
        return $name == ''
            ? $b
            : $b->where('name', 'like', '%' . $name . '%');
    }

    /**
     * @param EloquentBuilder $b
     * @param State $state
     * @return EloquentBuilder
     */
    function scopeByState(EloquentBuilder $b, State $state)
    {
        return $b->where('state_id', $state->id);
    }

    /**
     * Search by suburb name. Case-insensitive
     * @param EloquentBuilder $b
     * @param string $suburb
     * @return EloquentBuilder
     */
    function scopeBySuburb(EloquentBuilder $b, $suburb)
    {
        return $b->where('suburb', 'like', $suburb);
    }

    /**
     * @param EloquentBuilder $b
     * @param $slug
     * @return EloquentBuilder
     */
    function scopeWhereSlug(EloquentBuilder $b, $slug)
    {
        return $b->where('slug', $slug);
    }


    /*========================================ATTRIBUTES========================================*/


    /**
     * @param $estateID
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function getLotAttributes($estateID)
    {
        $estate = $this::findOrFail($estateID);

        return $estate->lotAttributes();
    }

    function setApprovedAttribute($value)
    {
        if (auth()->user()->can('approve-estate')) {
            $this->attributes['approved'] = $value > 0 ? 1 : 0;
        }
    }

    function getSlugAttribute()
    {
        return Str::slug($this->name);
    }

    function getSuburbSlugAttribute()
    {
        return Str::slug($this->suburb);
    }

    function getWebsiteAttribute($site)
    {
        if (stripos($site, 'https://') !== 0 && stripos($site, 'http://') !== 0) {
            $site = 'http://' . $site;
        }

        return $site;
    }

    public function getSortEstateAmenitiesAttribute()
    {
        $amenities = [];

        $this->estateAmenities->each(function (&$item) use (&$amenities) {
            $amenities[$item->type_name][] = $item;
        });
        return (object)$amenities;
    }

    function getPublicUrlAttribute()
    {
        return secure_url(route('estate.show', ['estate' => $this->id], true));
    }

    function getIsConfirmedAccurateAttribute()
    {
        if (!$this->confirmed_at) {
            return false;
        }

        return $this->confirmed_at === $this->updated_at && Carbon::createFromTimestamp($this->confirmed_at)->diffInDays(Carbon::now()) < 1;
    }


    /*========================================FUNCTIONS========================================*/


    /**
     * @return \Illuminate\Support\Collection
     */
    function listColumnsByOrder()
    {
        return $this->lotAttributes()
            ->orderBy('order')
            ->get(['id', 'display_name', 'color', 'order', 'attr_name', 'column_type'])
            ->keyBy('order')
            ->values();
    }

    /**
     * @param array $filters
     * @param Builder|LandDeveloper|EstateManager|InvitedUser $user
     * @return array
     */
    function filterStagesWithLots(array $filters, $user = null)
    {
        $filters['estate_id'] = $this->id;
        $columns = $this->listColumnsByOrder();

        $stagesCollection = $this
            ->stage()
            ->orderBy('sold')
            ->orderBy('name');

        $unsoldLots = $filters['unsold_lots'] ?? false;

        if ($unsoldLots) $stagesCollection->unsold();

        $isInvitedUser = $user instanceof InvitedUser;

        if ($user) {
            $isBuilder = $isInvitedUser
                ? $user->isBuilderUser
                : $user->company->isBuilder() && !$user->isGlobalAdmin();
            // $hasLotDrawerFeature = $isInvitedUser ? false : $user->can('premiumFeature', [$this, 'lot-drawer']);

            if (!$isInvitedUser && $isBuilder) {
                $filters['builder_company'] = $user->company->id;
            }

            if ($isInvitedUser || $isBuilder) {
                $stagesCollection->published();
            }
        } else {
            $isBuilder = $this->company->isBuilder();
            if ($isBuilder) {
                $filters['builder_company'] = $this->company->id;
            }
            if ($isBuilder) {
                $stagesCollection->published();
            }
        }

        $stages = $stagesCollection->get(['id', 'name', 'published', 'sold'])->toArray();
        $builderCompanies = $user ? $user->getBuilderCompanies() : [$this->company->id];
        $lotsCount = 0;
        foreach ($stages as &$stage) {
            $filters['stage_id'] = $stage['id'];
            $lotsCollection = Lot::getFilteredCollection($filters, $columns);

            $stage['lotmixLotsVisibility'] = $lotsCollection->pluck('lotmix_visibility');
            $stage['lotsVisibility'] = $lotsCollection->pluck('lot_visibility');
            $stage['lotPackages'] = $lotsCollection->pluck('lot_packages');
            $stage['lotIds'] = $lotsCollection->pluck('id');
            $stage['drawerData'] = $lotsCollection->pluck('drawer_data');
            $stage['lotRotation'] = $lotsCollection->pluck('rotation');
            $stage['lotImages'] = collect([]);
            $stage['drawerTheme'] = LotDrawerTheme::where('stage_id', $stage['id'])->first();

            $lotIndex = 0;
            $lots = $lotsCollection->map(function ($item) use ($stage, $isBuilder, &$lotIndex, $builderCompanies) {
                if ($item->lot_visibility == Lot::visibility['partial']) {
                    $lotCompanies = LotVisibility::byLotId($item->id)->get(['company_id']);
                    $lotCompanies->transform(function ($lotCompany) use ($builderCompanies) {
                        return isset($builderCompanies[$lotCompany->company_id])
                            ? $builderCompanies[$lotCompany->company_id]['name']
                            : 'N/A';
                    });
                    $stage['lotsVisibility'][$lotIndex] = $lotCompanies->isEmpty()
                        ? Lot::visibility['disabled']
                        : $lotCompanies->all();
                }
                $stage['lotImages'][] = $item->lot_image ? File::storageUrl($item->lot_image) : null;
                unset($item->id, $item->lot_visibility, $item->lot_packages, $item->drawer_data, $item->lot_image, $item->rotation, $item->lotmix_visibility);
                if ($isBuilder && $stage['sold'] && isset($item->price)) {
                    $item->price = null;
                }
                ++$lotIndex;

                return array_values((array)$item);
            });
            $lotsCount += $lots->count();
            $stage['lots'] = $lots;
        }

        $estate = $this->fresh();
        $estate->load('houseState', 'estateGallery', 'estateSnapshots', 'estateFaq');
        $estate->append('isConfirmedAccurate', 'sortEstateAmenities');
        $estate->geo_coords = static::transformCoordsToArray($estate->geo_coords);
        $estate->lots_count = $lotsCount;

        $response = [
            'columns' => $columns,
            'stages' => $stages,
            'estate' => $estate,
            'isBuilder' => $isBuilder,
            'ESTATE_UPDATED' => true
        ];

        if ($user && !$isInvitedUser) {
            $developerPerms = [
                Permission::PriceEditor,
                Permission::ListManager
            ];
            if ($user->isGlobalAdmin()) {
                $permissions = array_merge($developerPerms, ['lotmix']);
            } else {
                if ($user->can('updateLotPackages', $this)) {
                    $permissions = ['pdf_manager'];
                } elseif ($user->can('developer-admin') || $user->has_lotmix_access) {
                    $permissions = array_merge($developerPerms, ['lotmix']);
                } else {
                    $permissions = $this->managerPermissions()
                        ->where('manager_id', $user->id)
                        ->get()
                        ->pluck('name');
                }
            }

            $features = $this->premiumFeatures()->get(['type'])->pluck('type');

            if ($user->isGlobalAdmin()) {
                $features = EstatePremiumFeatures::features;
            }

            $regions = Region::all();
            $response = [
                'columns' => $columns,
                'stages' => $stages,
                'estate' => $estate,
                'regions' => $regions,
                'isBuilder' => $isBuilder,
                'has_discovery' => $user->can('discovery'),
                'permissions' => $permissions,
                'features' => $features,
                'can_approve' => $user->can('approve-estate'),
                'ESTATE_UPDATED' => true,
            ];
        }

        return $response;
    }

    /**
     * @param $userId
     * @return EloquentBuilder
     */
    static function getManagerEstates($userId)
    {
        $q = self::query();
        $q->getQuery()->from($q->getQuery()->from . ' AS e');

        return $q
            ->select(
                'e.id', 'e.name', 'e.thumb', 'e.small', 'e.path',
                DB::raw("(SELECT GROUP_CONCAT(CONCAT(permissions.id, ':', permissions.name))
                           FROM permissions
                           INNER JOIN estate_manager_permissions
                            ON estate_manager_permissions.permission_id = permissions.id
                            WHERE estate_manager_permissions.estate_id = e.id and manager_id = {$userId}) as permissions")
            )
            ->groupBy('e.id', 'e.name', 'e.thumb', 'e.small', 'e.path')
            ->where([
                'e.approved' => 1
            ])
            ->orderBy('e.name');
    }

    function createDynamicAttributesFromArray(array $columns)
    {
        foreach ($columns as $name) {
            if ($name) {
                $column = $this->lotAttributes()
                    ->byDisplayOrAttrName($name)
                    ->get(['id']);

                if ($column->isEmpty()) {
                    $this->lotAttributes()->create([
                        'display_name' => $name,
                        'attr_name' => LotAttributes::generateAttrNameFromDisplayName($name),
                        'column_type' => 'dynamic'
                    ]);
                }
            }
        }
    }

    /**
     * @param $companyId
     * @param $filters
     * @return Collection
     */
    static function getEstatesWithPdfManagers($companyId, $filters)
    {
        $estates = DB::table('estates as e')
            ->select(
                'e.id',
                'e.thumb',
                'e.small',
                'e.path',
                'e.name',
                'e.state_id',
                DB::raw('count(u.id) as pdf_managers_count'),
                DB::raw('GROUP_CONCAT(u.id) as managers')
            )
            ->leftJoin(DB::raw('(SELECT * FROM `pdf_managers`) p'), function ($join) {
                $join->on('p.estate_id', '=', 'e.id');
            })
            ->leftJoin(DB::raw('(SELECT id, display_name, company_id FROM `uf_users`) u'), function ($join) use ($companyId) {
                $join->on('p.manager_id', '=', 'u.id')
                    ->where('u.company_id', '=', $companyId);
            })
            ->where(function (QueryBuilder $b) use ($filters) {
                $v = $filters['estateName'] ?? '';
                if ($v != '') {
                    $b->where('e.name', 'like', "%{$v}%");
                }
                $v = $filters['state_id'] ?? 0;
                if ($v > 0) {
                    $b->where('e.state_id', '=', $v);
                }
                $v = $filters['published'] ?? 0;
                if ($v > 0) {
                    $b->where('e.published', '=', $v);
                }
                $v = $filters['approved'] ?? 0;
                if ($v > 0) {
                    $b->where('e.approved', '=', $v);
                }
                $v = $filters['lotmix_public'] ?? 0;
                if ($v > 0) {
                    $b->where('e.lotmix_public', '=', $v);
                }
                $v = $filters['name'] ?? '';
                if ($v != '') {
                    $b->where('u.display_name', 'like', "%{$v}%");
                }
            })
            ->groupBy('e.id', 'e.thumb', 'e.small', 'e.path', 'e.name', 'e.state_id')
            ->get();

        $v = $filters['emptyEstates'] ?? 0;
        if ($v > 0) {
            $estates = $estates->filter(function ($item) {
                $item->managers = [];

                $item->thumb = Estate::getValidPath($item->thumb ?? $item->path);
                $item->small = Estate::getValidPath($item->small ?? $item->path);
                unset($item->path);

                return $item->pdf_managers_count == 0;
            });
        } else {
            $estates = $estates->map(function ($item) {
                $managers = [];

                $item->thumb = Estate::getValidPath($item->thumb ?? $item->path);
                $item->small = Estate::getValidPath($item->small ?? $item->path);
                unset($item->path);

                if ($item->pdf_managers_count != 0) {
                    $managerIds = explode(',', $item->managers);
                    $managers = User::orderBy('display_name')->find($managerIds, ['id', 'display_name']);
                    $item->managers = $managers;
                } else {
                    $item->managers = $managers;
                }

                return $item;
            });
        }

        return $estates->values();
    }

    /**
     * @param $permission
     * @param $managerId
     * @return bool
     */
    public function checkPermission($permission, $managerId)
    {
        return $this
            ->estatePermissions()
            ->where('permission_id', Permission::byName($permission)->first()->id)
            ->where('manager_id', $managerId)
            ->exists();
    }

    /**
     * @param $feature
     * @return bool
     */
    public function checkPremiumFeature($feature)
    {
        return (in_array($feature, EstatePremiumFeatures::features) &&
            $this->premiumFeatures->pluck('type')->contains($feature));
    }

    /**
     * @param $builderCompanyId
     * @return mixed
     */
    function getPdfManagersCount($builderCompanyId)
    {
        return $this
            ->pdfManagers()
            ->byCompany($builderCompanyId)
            ->count();
    }

    /**
     * @return mixed
     */
    function drawnLots()
    {
        return $this->estateLots()->hasDrawerData()->get(['lots.id', 'lots.lot_number']);
    }

    /**
     * Returns a filtered collection of estates and lots
     * Filters: [estate_name, suburb, published, unsold_lots, lotmix, status, width, depth, area, max_area, min, max]
     *
     * @param array $filters
     * @return array
     */
    static function getEstatesLotCount(array $filters): array
    {
        $estatesQB = EstateRepository::createEstatesLotsCountQB($filters);
        $estatesWithLotsQB = EstateRepository::createFilteredLotsCountQB($filters);
        $estatesQB = EstateRepository::filterByPremiumFeaturesQB($estatesQB, EstatePremiumFeatures::FEATURE_LOTMIX);
        $estatesWithLotsQB = EstateRepository::mergeColumnsAndLotsCountQB($estatesQB, $estatesWithLotsQB);

        $estatesWithLotsQB->whereNotNull('lc.lots_count');

        $lotIds = $estatesWithLotsQB->get()->reduce(function ($carry, $item) {
            $carry = array_merge($carry, explode(',', $item->lot_ids));
            return $carry;
        }, []);

        $lots = Lot::Find($lotIds);

        $estates = $estatesWithLotsQB->inRandomOrder()->get();
        return [$estates, $lots];
    }

    /**
     * @param Collection $estates
     * @return Collection
     */
    static function transformCoordsAndSmallImage(Collection $estates)
    {
        return $estates->map(function ($item) {
            $item->geo_coords = self::transformCoordsToArray($item->geo_coords);
            $item->smallImage = Estate::getValidPath($item->small ?? $item->path);
            $item->logo = Estate::getValidPath($item->logo ?? $item->small ?? $item->path);
            unset($item->path);
            return $item;
        });
    }


    /**
     * Returns array of sidebar filters by lots collection
     *
     * @param Collection $lots
     * @return array
     */
    static function getLotsSidebarFilters(Collection $lots): array
    {
        $filters['price_max'] = $lots->max('price')
            ? MathHelper::roundUpToIncrement((int)$lots->max('price'))
            : 0;
        $filters['price_min'] = $lots->min('price')
            ? MathHelper::roundDownToIncrement((int)$lots->min('price'))
            : 0;
        $filters['status'] = $lots->pluck('status')->unique()->sort()->values();

        return $filters;
    }

    /**
     * @param $geo_coords
     * @return false|string|string[]|null
     */
    static function transformCoordsToArray($geo_coords)
    {
        $geo_coords = is_string($geo_coords) ? $geo_coords : null;
        if (!empty($geo_coords)) {
            $geo_coords = explode(',', $geo_coords);
            settype($geo_coords[0], 'float');
            settype($geo_coords[1], 'float');
        }
        return $geo_coords;
    }

    /**
     * Get the options for generating the slug.
     */
    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('name')
            ->saveSlugsTo('slug');
    }
}
