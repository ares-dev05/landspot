<?php

namespace App\Models;

use App\Models\Sitings\HasSitingsCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use App\Models\Sitings\Siting;
use Illuminate\Support\Collection;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

/**
 * Class Company
 * @property int builder_id
 * @property int chas_discovery
 * @property int chas_footprints
 * @property int chas_estates_access
 * @property int chas_lotmix
 * @property int chas_nearmap
 * @property int id
 * @property string name
 * @property string description
 * @property string phone
 * @property string email
 * @property string website
 * @property string ckey
 * @property string domain
 * @property string folder
 * @property string type
 * @property string logo_path
 * @property string small_logo_path
 * @property string expanded_logo_path
 * @property string verify_domain
 * @property string main_image_path
 * @property string video_link
 * @property string main_address
 * @property string nearmap_api_key
 *
 * @property string company_logo (accessor)
 * @property string company_small_logo (accessor)
 * @property string company_expanded_logo (accessor)
 * @property string company_main_image (accessor)
 *
 * @property string subdomain (accessor)
 * @property Estate estate
 * @property House house
 * @property Range range
 * @property Collection user
 * @property SalesLocation salesLocation
 * @property FeatureNotification featureNotification
 * @property LotmixStateSettings lotmixStateSettings
 * @property ThemeColor themeColor
 * @property InvitedUser userInvitedUsers
 *
 * @method static Company firstOrCreate(...$args)
 * @method static Company firstOrNew(...$args)
 * @method static Company findOrFail(...$args)
 * @method static Company whereIn(...$args)
 *
 * @method static Company authorizedBuilders(...$args)
 * @method static Company builderCompany()(...$args)
 * @method static Company bybuilderId()(...$args)
 * @method static Company byId(...$args)
 * @method static Company byDomainLike(...$args)
 * @method static Company byNameLike()(...$args)
 * @method static Company developerCompany()(...$args)
 * @method static Company hasDiscovery()(...$args)
 * @method static Company hasEstatesAccess()(...$args)
 * @method static Company hasLotmix()(...$args)
 * @method static Company byIds(...$args)
 * @method static Company whereHas(...$args)
 * @method static Company hasBriefAdmin()
 * @method static scopes(string[] $array)
 * @method static whereName($name)
 * @method static whereSlug($param)
 * @method where(string $string, string $string1)
 * @method whereNotNull(string $string)
 */
class Company extends Model implements FileStorageInterface
{
    use FileStorageTrait, HasSitingsCompany, HasSlug;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'companies';
    public $timestamps = false;

    protected static $storageFolder = 'company_logos';

    protected $fillable = [
        'type', 'name', 'theme_id', 'domain', 'builder_id', 'ckey', 'folder',
        'chas_discovery', 'chas_footprints', 'logo_path', 'small_logo_path', 'expanded_logo_path',
        'verify_domain', 'chas_estates_access', 'template_thumb', 'description', 'email', 'phone', 'website',
        'chas_lotmix', 'main_image_path', 'video_link', 'main_address', 'slug', 'chas_nearmap',
        'nearmap_api_key'
    ];

    protected $appends = ['company_logo', 'company_small_logo', 'company_expanded_logo', 'company_main_image'];

    protected $attributes = ['ckey' => '', 'folder' => '', 'theme_id' => 0];

    protected $hidden = [
        'logo_path', 'small_logo_path', 'expanded_logo_path', 'ckey', 'folder',
        'use_as_bot', 'chas_envelopes', 'chas_exclusive', 'chas_footprints', 'chas_master_access',
        'chas_multihouse', 'chas_portal_access', 'verify_domain', 'theme_id'
    ];

    const fileStorageFields = ['logo_path', 'small_logo_path', 'expanded_logo_path'];

    const LOTMIX_ACCESS_DISABLED = 0;
    const LOTMIX_ACCESS_ENABLED = 1;

    const NEARMAP_NO_ACCESS = 0;
    const NEARMAP_COMPANY_ACCESS = 1;
    const NEARMAP_USER_ACCESS = 2;

    static function getFilesStorageFields()
    {
        return static::fileStorageFields;
    }

    function isDeveloper()
    {
        return $this->type == 'developer';
    }

    function isBuilder()
    {
        return $this->type == 'builder';
    }

    function scopeBuilderCompany(EloquentBuilder $b)
    {
        return $b->where($b->qualifyColumn('type'), 'builder');
    }

    function scopebyBuilderId(EloquentBuilder $b, $builderId)
    {
        return $b
            ->builderCompany()
            ->where('builder_id', 'like', $builderId);
    }

    function scopeDeveloperCompany(EloquentBuilder $b)
    {
        return $b->where('type', 'developer');
    }

    function scopeById(EloquentBuilder $b, $id)
    {
        return $b->where($b->qualifyColumn('id'), $id);
    }

    function scopeAuthorizedBuilders(EloquentBuilder $b)
    {
        return $b
            ->where($b->qualifyColumn('type'), 'builder')
            ->where('chas_footprints', 0)
            ->where('chas_discovery', 0);
    }

    function scopeHasDiscovery(EloquentBuilder $b)
    {
        return $b->where([
            $b->qualifyColumn('type') => 'builder',
            'chas_discovery' => 1
        ]);
    }

    function scopeHasEstatesAccess(EloquentBuilder $b)
    {
        return $b->where(function (EloquentBuilder $q) {
            $q->where([
                'chas_footprints' => 1,
                'chas_estates_access' => 1,
            ])->orWhere([
                'chas_footprints' => 0
            ]);
        });
    }

    function scopeHasLotmix(EloquentBuilder $b)
    {
        return $b->where([
            'chas_lotmix' => 1
        ]);
    }

    function scopeByNameLike(EloquentBuilder $b, $name, $partialMatch = true)
    {
        return $name == ''
            ? $b
            : $b->where('name', 'like', $partialMatch ? '%' . $name . '%' : $name);
    }

    function scopeByDomainLike(EloquentBuilder $b, $name)
    {
        return $name == ''
            ? $b
            : $b->where('domain', 'like', $name . '%');
    }

    function scopeByIds(EloquentBuilder $b, $ids = [])
    {
        return empty($ids)
            ? $b
            : $b->whereIn('id', $ids);
    }

    function scopeHasBriefAdmin(EloquentBuilder $b)
    {
        return $b->whereHas('user', function ($q) {
            $q->where('is_brief_admin', true);
        });
    }

    function scopeWhereSlug(EloquentBuilder $b, $slug)
    {
        return $b->where('slug', $slug);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */

    public function estate()
    {
        return $this->hasMany(Estate::class);
    }

    public function house()
    {
        return $this->hasManyThrough(House::class, Range::class, 'cid', 'range_id', 'id', 'id');
    }

    public function sitings()
    {
        return $this->hasManyThrough(Siting::class, User::class);
    }

    public function salesLocation()
    {
        return $this->hasMany(SalesLocation::class);
    }

    function user()
    {
        return $this->hasMany(User::class);
    }

    function range()
    {
        return $this->hasMany(Range::class, 'cid');
    }

    function lotPackage()
    {
        return $this->hasMany(LotPackage::class);
    }

    function lotmixStateSettings()
    {
        return $this->hasMany(LotmixStateSettings::class, 'company_id');
    }

    public function featureNotification()
    {
        return $this->morphedByMany(FeatureNotification::class, 'notification', 'company_notification');
    }

    function themeColor()
    {
        $relation = $this->hasOne(ThemeColor::class, 'tid', 'theme_id');
        $q = $relation->getBaseQuery();
        $q->where('name', 'color_class_2');

        return $relation;
    }

    function invitedUser()
    {
        return $this->belongsToMany(InvitedUser::class, 'user_invited_users', 'company_id', 'invited_user_id');
    }

    function sitingInvitedUsers()
    {
        return $this->hasManyThrough(
            InvitedUser::class,
            SitingInvitedUsers::class,
            'company_id',
            'id',
            'id',
            'invited_user_id'
        );
    }

    function invitedUserSiting()
    {
        return $this->belongsToMany(Siting::class, 'siting_invited_users', 'company_id', 'siting_id')
            ->using(SitingInvitedUsers::class)
            ->withPivot([
                'company_id', 'invited_user_id'
            ]);
    }


    public function briefs()
    {
        return $this->hasManyThrough(
            Brief::class,
            BriefCompany::class,
            'company_id',
            'id',
            'id',
            'brief_id');
    }

    static function getLogoUrl($logoPath)
    {
        return $logoPath
            ? ($logoPath == '' || strpos($logoPath, 'http') === 0)
                ? $logoPath
                : File::storageUrl($logoPath)
            : 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHhtbG5zID0gImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aCA9ICIyMjAiIGhlaWdodCA9ICI0MCIgdmlld0JveCA9ICIwIDAgMjAwIDQwIj48dGV4dCB4ID0gIjAiIHkgPSAiMzAiIGZvbnQtZmFtaWx5ID0gIlZlcmRhbmEiIGZvbnQtc2l6ZSA9ICIyNCIgZmlsbD0iIzQ4NGJjYyI+Tm8gY29tcGFueSBsb2dvPC90ZXh0Pjwvc3ZnPgo=';
    }

    static function getMainImageUrl($imagePath)
    {
        return $imagePath
            ? ($imagePath == '' || strpos($imagePath, 'http') === 0)
                ? $imagePath
                : File::storageUrl($imagePath)
            : null;
    }

    function getSitingsSaveSettingAttribute()
    {
        return (object)LotmixStateSettings::SITING_SAVE_SETTINGS;
    }

    function getCompanyLogoAttribute()
    {
        return self::getLogoUrl($this->logo_path);
    }

    function getHasFootprintsAttribute()
    {
        return $this->chas_footprints;
    }

    function getIsLandconnectAttribute()
    {
        return strtolower($this->name) === 'landconnect';
    }

    function getCompanySmallLogoAttribute()
    {
        return self::getLogoUrl($this->small_logo_path);
    }

    function getCompanyExpandedLogoAttribute()
    {
        return self::getLogoUrl($this->expanded_logo_path);
    }

    function getCompanyMainImageAttribute()
    {
        return self::getMainImageUrl($this->main_image_path);
    }

    function getCompanyThemeColorAttribute()
    {
        if ($this->isBuilder()) {
            $color = optional($this->themeColor)->color;
            if ($color) {
                return sprintf('#%06X', $color);
            }
        }
    }

    /**
     * @return bool
     */
    function getHasInvitedUsersAttribute()
    {
        return $this->invitedUser()->exists();
    }

    function getSubdomainAttribute()
    {
        if ($domain = $this->domain) {
            $hostAddress = explode('.', $domain);
            if (is_array($hostAddress)) {
                if (preg_match('/www/i', $hostAddress[0])) {
                    $passBack = 1;
                } else {
                    $passBack = 0;
                }
                return ($hostAddress[$passBack]);
            } else {
                return 'landspot';
            }
        } else {
            return 'landspot';
        }
    }


    /*========================================FUNCTIONS========================================*/


    /**
     * @param int $limit
     * @return Collection
     */
    public function getRandomHousesWithFacades($limit = 10)
    {
        return $this->house()
            ->whereHas('facades')
            ->with('facades')
            ->byDiscovery(House::DISCOVERY_ENABLE)
            ->inRandomOrder()
            ->limit($limit)
            ->get();
    }

    /**
     * @return Collection|array
     */
    function getUniqueStateIds()
    {
        return $this->user()
            ->get(['state_id'])
            ->pluck('state_id')
            ->unique();
    }

    /**
     * @return Collection
     */
    static function getBriefAdminCompanies()
    {
        return static::scopes(['hasBriefAdmin', 'hasDiscovery', 'hasEstatesAccess'])
            ->orderBy(\DB::raw('RAND()'))
            ->get()
            ->keyBy('id');
    }

    /**
     * @param $stateIds
     * @return Company
     */
    static function builderCompaniesInState($stateIds)
    {
        return static::builderCompany()
            ->whereHas('range', function (EloquentBuilder $query) use ($stateIds) {
                $query->whereIn('state_id', $stateIds);
            });
    }

    /**
     * @return Collection
     */
    function getLotmixUserFilters(): Collection
    {
        $statesList = State::all(['id'])->pluck('id')->toArray();
        return $this->range()
            ->whereIn('state_id', $statesList)
            ->get(['id'])
            ->pluck('id');
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
