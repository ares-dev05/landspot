<?php

namespace App\Models\Sitings;

use App\Models\{Company,
    File,
    FileStorageTrait,
    House,
    InvitedUser,
    PDFRender,
    LotmixStateSettings,
    SitingInvitedUsers,
    User
};
use Illuminate\Database\Eloquent\{Model, Builder as EloquentBuilder, Relations\HasOne};
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Class Siting
 * @property int id
 * @property int user_id
 * @property int created_at
 * @property int updated_at
 * @property int page_size
 * @property int page_scale
 * @property int house_svgs_id
 * @property string path
 * @property string thumb
 * @property string engineering
 * @property string nearmap
 * @property string file_name
 * @property string fileURL (accessor)
 * @property string first_name
 * @property string last_name
 * @property string lot_number
 * @property string street
 * @property string house
 * @property string extra_details
 * @property string lot_no
 * @property string sp_no
 * @property string parent_lot_no
 * @property string parent_sp_no
 * @property string House sitingHouse
 * @property string facade
 * @property string options
 * @property string imageURL (accessor)
 * @property bool hasBuyer (accessor)
 * @property array userActions (accessor)
 * @property int status
 * @property User user
 * @property House sitingHouse
 * @property ReferencePlan referencePlan
 * @property DrawerData drawerData
 * @property InvitedUser buyer
 * @property EngineeringPlan engineeringPlan
 * @method static Siting find(...$args)
 * @method static byUser(...$args)
 * @method static byId(...$args)
 * @method static byStatus(...$args)
 * @method static Siting findOrFail($id)
 * @method where(...$args)
 */
class Siting extends Model
{
    use CustomFiltersTrait, FileStorageTrait;

    const fileStorageFields = ['path', 'thumb', 'engineering', 'nearmap'];
    static $storageFolder = 'sitings_brochure';

    const SITING_STATUS = [
        self::STATUS_IN_PROGRESS => 'Unfinished Siting',
        self::STATUS_COMPLETED => 'Completed',
        self::STATUS_DRAFT => 'Draft'
    ];

    const STATUS_IN_PROGRESS = 0;
    const STATUS_COMPLETED = 1;
    const STATUS_DRAFT = 2;
    const STATUS_NEW = 3;

    public $timestamps = true;
    protected $dateFormat = 'U';
    protected $table = 'sitings';
    protected $fillable = [
        'user_id', 'first_name', 'last_name', 'lot_number',
        'street', 'extra_details', 'page_size', 'page_scale',
        'lot_no', 'sp_no', 'parent_lot_no', 'parent_sp_no',
        'house', 'facade', 'options', 'path', 'file_name', 'house_svgs_id',
        'thumb', 'engineering', 'nearmap', 'status', 'lot_area', 'site_coverage'
    ];
    protected $hidden = ['user_id', 'path', 'status'];
    protected $appends = ['house_id'];
    protected $attributes = [
        'status' => self::STATUS_IN_PROGRESS,
        'first_name' => '',
        'last_name' => '',
        'lot_number' => '',
        'street' => '',
        'extra_details' => '',
        'lot_no' => '',
        'sp_no' => '',
        'parent_lot_no' => '',
        'parent_sp_no' => '',
        'page_scale' => 200
    ];

    protected static function boot()
    {
        parent::boot();

        static::deleting(function (Siting $siting) {
            if ($referencePlan = $siting->referencePlan) {
                $referencePlan->delete();
            }

            if ($engineeringPlan = $siting->engineeringPlan) {
                $engineeringPlan->delete();
            }

            if ($drawerData = $siting->drawerData) {
                $drawerData->delete();
            }
        });

        static::saving(function (Siting $siting) {
            if (!$siting->page_scale) {
                $siting->page_scale = 200;
            }
        });

        static::addGlobalScope('userVisibility', function (EloquentBuilder $b) {
            /** @var User $user */
            $user = auth()->user();
            if ($user && ($user instanceof User && !$user->can('sitings-global-admin'))) {
                $b->byUser($user->id);
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function referencePlan()
    {
        return $this->hasOne(ReferencePlan::class);
    }

    public function engineeringPlan()
    {
        return $this->hasOne(EngineeringPlan::class);
    }

    public function drawerData()
    {
        return $this->hasOne(DrawerData::class);
    }

    function sharedSiting()
    {
        return $this->hasMany(SharedSiting::class, 'siting_id');
    }

    public function sitingHouse()
    {
        return $this->belongsTo(House::class, 'house_svgs_id', 'house_svgs_id');
    }

    public function getSittingHouseByTitleAttribute()
    {
        if ($this->house) {
            $cid = $this->user->company_id;
            $stateId = $this->user->state_id;

            return House::where('title', 'like', $this->house)
                ->whereHas('range', function ($q) use ($cid, $stateId) {
                    $q->where('cid', $cid)->where('state_id', $stateId);
                })->with('attributes')
                ->first();
        }
        return null;
    }

    public function getAbsoluteUrlAttribute()
    {
        return config('app.SITINGS_URL') . route('siting.export', $this->id, false);
    }

    public function getResiteUrlAttribute()
    {
        return config('app.SITINGS_URL') . route('siting.houses', $this->id, false);
    }

    public function buyer()
    {
        return $this->belongsToMany(InvitedUser::class, 'siting_invited_users', 'siting_id', 'invited_user_id')
            ->using(SitingInvitedUsers::class)
            ->withPivot([
                'company_id'
            ]);
    }

    function getFileURLAttribute()
    {
        return $this->path ? File::storageTempUrl($this->path, now()->addDay(2)) : null;
    }

    function getProtectedFileURLAttribute()
    {
        return route('siting-preview', ['siting' => $this->id]);
    }

    function getImageURLAttribute()
    {
        return $this->thumb ? File::storageTempUrl($this->thumb, now()->addDay(2)) : null;
    }

    function getEngineeringURLAttribute()
    {
        return $this->engineering ? File::storageTempUrl($this->engineering, now()->addDay(2)) : null;
    }

    function getNearmapURLAttribute()
    {
        return $this->nearmap ? File::storageTempUrl($this->nearmap, now()->addDay(2)) : null;
    }

    function getViewURLAttribute()
    {
        return route('export-doc', ['referencePlan' => $this->id]);
    }

    function getViewURLEngineeringAttribute()
    {
        return route('export-doc-engineering', ['engineeringPlan' => $this->id]);
    }

    function getXmlURLAttribute()
    {
        return route('company-data', $this, false);
    }

    function getThemeURLAttribute()
    {
        return route('company-theme', $this, false);
    }

    function getHouseURLAttribute()
    {
        return route('house-data', [$this, 'house-id'], false);
    }
    function getEnvelopeURLAttribute()
    {
        return route('envelope-catalogue', $this, false);
    }
    function getFacadeURLAttribute()
    {
        return route('facade-catalogue', $this, false);
    }
    function getHasBuyerAttribute()
    {
        return $this->buyer()->exists();
    }

    function getUserActionsAttribute()
    {
        return [
            LotmixStateSettings::SITING_EXPORT_PERMISSIONS[LotmixStateSettings::SAVE_AND_EXPORT],
            LotmixStateSettings::SITING_EXPORT_PERMISSIONS[LotmixStateSettings::ASSIGN_TO_CLIENT]
        ];
    }

    function getUserSettingsAttribute()
    {
        $user = $this->user;
        return [
            'state' => $user->state_id,
            'multihouse' => $user->has_multihouse,
            'builder' => $user->company->builder_id,
            'has_nearmap' => $user->company->chas_nearmap===Company::NEARMAP_COMPANY_ACCESS ||
                            ($user->company->chas_nearmap===Company::NEARMAP_USER_ACCESS && $user->has_nearmap) ? 1 : 0,
            'nearmap_api_key' => $user->company->nearmap_api_key,
        ];
    }

    function getReferencePlan()
    {
        $referencePlan = $this->referencePlan()->first();
        optional($referencePlan)->load('pages');

        return $referencePlan;
    }

    function getEngineeringPlan()
    {
        $engineeringPlan = $this->engineeringPlan()->first();
        optional($engineeringPlan)->load('pages');

        return $engineeringPlan;
    }

    /**
     * @return Model
     */
    function getDrawerData()
    {
        return $this->drawerData()->firstOrCreate([]);
    }

    /**
     * @param EloquentBuilder $b
     * @param $id
     * @return EloquentBuilder
     */
    function scopeByUser(EloquentBuilder $b, $id)
    {
        return $b->where('user_id', $id);
    }

    function scopeById(EloquentBuilder $b, $id)
    {
        return $b->where($b->qualifyColumn('id'), $id);
    }

    /**
     * @param EloquentBuilder $b
     * @param int $status
     * @return EloquentBuilder
     */
    function scopeByStatus(EloquentBuilder $b, $status)
    {
        return $b->where($b->qualifyColumn('status'), $status);
    }

    /**
     * @param EloquentBuilder $b
     * @return EloquentBuilder
     */
    function scopeWithUnfinishedSiting(EloquentBuilder $b)
    {
        return $b->where(function ($b) {
            $b->byStatus(Siting::STATUS_IN_PROGRESS)
                ->where($b->qualifyColumn('updated_at'), '>=', now()->subWeek(1)->startOfDay()->timestamp);
        });
    }

    /**
     * @param EloquentBuilder $b
     * @param string $name
     * @return EloquentBuilder
     */
    function scopeByClient(EloquentBuilder $b, $name)
    {
        return $b->where(DB::raw("CONCAT_WS(' ', `first_name`, `last_name`)"), 'like', "%{$name}%");
    }

    /**
     * @return string
     */
    function getTemplateImageAttribute()
    {
        return $this->user->company->templateImage;
    }

    /**
     * @return int
     */
    function getHouseIdAttribute()
    {
        return $this->house_svgs_id ? optional($this->sitingHouse)->id : null;
    }

    /**
     * @return int
     */
    function getStatusLabelAttribute()
    {
        return self::SITING_STATUS[$this->attributes['status']];
    }

    /**
     * @param LegacySiting $legacySiting
     */
    function migrate($legacySiting)
    {
        if (!$legacySiting) {
            return;
        }

        // Migrate the drawer data
        $drawerData = $this->getDrawerData();
        $drawerData->migrate($legacySiting);

        // Migrate client and siting details
        foreach (['first_name', 'last_name', 'lot_number', 'street', 'extra_details',
                     'house_svgs_id', 'house', 'facade', 'options'] as $key) {
            $this[$key] = $legacySiting[$key];
        }
        foreach (['lot_no', 'sp_no', 'parent_lot_no', 'parent_sp_no'] as $key) {
            $this[$key] = '';
        }
        $this->save();
    }

    /**
     * @param array $filters
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    static function getFilteredCollection(array $filters)
    {
        $sitingsQuery = Siting::query();

        $sitingsQuery->customFilters($filters);
        $sitingsQuery->select($sitingsQuery->qualifyColumn('*'));

        return $sitingsQuery->paginate(30);
    }

    static function getFilesStorageFields()
    {
        return static::fileStorageFields;
    }

    /**
     * @param string $name
     * @return \Illuminate\Support\Collection
     */
    static function getAutocompleteNames($name = 'client')
    {
        $sitingsQuery = Siting::query();

        switch ($name) {
            case 'house':
                $sitingsQuery->whereNotNull('house');
                return $sitingsQuery->get(['house as name']);
            case 'client':
            default:
                return $sitingsQuery->get([DB::raw("CONCAT_WS(' ', `first_name`, `last_name`) AS name")]);
        }
    }

    /**
     * @return bool|string
     * @throws \Exception
     */
    function getCompanyDataXml()
    {
        /** @var User $user */
        $user = $this->user;
        UserAPI::setAccessToken($user->access_token);

        if ($user->company_id == 22 || $user->company_id == 23 ||  $user->company_id == 39 || $user->company_id == 42) {
            $command = 'getcompanydatasvg';
        } else {
            $command = 'getcompanyranges';
        }

        $query = http_build_query([
            'ckey' => $user->company->ckey,
            'state' => $user->state_id,
            'command' => $command,
            'multihouse' => $user->has_multihouse,
            'exclusive' => $user->has_exclusive
        ]);

        return UserAPI::get('lcapi-call', compact('query'));
    }

    /**
     * @return bool|string
     * @throws \Exception
     */
    function getCompanyThemeXml()
    {
        /** @var User $user */
        $user = $this->user;
        UserAPI::setAccessToken($user->access_token);
        $query = http_build_query([
            'ckey' => $user->company->ckey,
            'state' => $user->state_id,
            'command' => 'getvisualtheme',
            'theme' => $user->company->theme_id
        ]);

        return UserAPI::get('lcapi-call', compact('query'));
    }

    /**
     * @param string $name
     * @return bool|string
     * @throws \Exception
     */
    function getHouseDataXml($house = 0)
    {
        /** @var User $user */
        $user = $this->user;
        UserAPI::setAccessToken($user->access_token);
        $query = http_build_query([
            'ckey' => $user->company->ckey,
            'state' => $user->state_id,
            'command' => 'gethousedata',
            'house' => $house
        ]);

        return UserAPI::get('lcapi-call', compact('query'));
    }

    /**
     * @return bool|string
     * @throws \Exception
     */
    function getEnvelopeCatalogueXml()
    {
        /** @var User $user */
        $user = $this->user;
        UserAPI::setAccessToken($user->access_token);
        $query = http_build_query([
            'ckey' => $user->company->ckey,
            'state' => $user->state_id,
            'command' => 'getenvelopecatalogue'
        ]);

        // return UserAPI::get('lcapi-call', compact('query'));
        return ""; // Ares Bug
    }

    /**
     * @return bool|string
     * @throws \Exception
     */
    function getFacadeCatalogueXml()
    {
//        /** @var User $user */
//        $user = $this->user;
//        UserAPI::setAccessToken($user->access_token);
//        $query = http_build_query([
//            'ckey' => $user->company->ckey,
//            'state' => $user->state_id,
//            'command' => 'getenvelopecatalogue'
//        ]);
//
//        return UserAPI::get('lcapi-call', compact('query'));

        return file_get_contents(public_path('storage/documents/facade-gallery/index.xml'));
    }

    /**
     * @param Siting $siting
     * @param bool $returnObject
     * @param null|InvitedUser $client
     * @return array
     * @throws \Throwable
     */
    function cloneSiting(Siting $siting, $returnObject = false, $client = null)
    {
        $newSiting = \DB::transaction(function () use ($siting, $client) {
            $newSiting = $siting->replicate();
            $newSiting->status = $client ? Siting::STATUS_COMPLETED : $newSiting->status;
            $newSiting->thumb = null;
            $newSiting->engineering = null;
            $newSiting->nearmap = null;
            $newSiting->path = null;
            $newSiting->save();

            /** @var DrawerData $drawerData */
            $drawerData = $siting->drawerData()->firstOrCreate([]);
            $newDrawerData = $drawerData->replicate();
            $newDrawerData->siting()->associate($newSiting);
            $newDrawerData->save();

            $this->replicatePlan($this->referencePlan(), $newSiting, $newDrawerData);
            $this->replicatePlan($this->engineeringPlan(), $newSiting, $newDrawerData);

            return $newSiting;
        });
        if ($client) {
            $client->processInvitation($newSiting);
        }
        $newSiting->append('absoluteUrl');

        return $returnObject ? $newSiting : compact('newSiting');
    }

    /**
     * @param Siting $siting
     * @param Company|HasSitingsCompany $company
     * @param $areaData
     * @param $rotation
     * @param $northRotation
     * @param $dualOccupancy
     * @return string
     * @throws \Throwable
     */
    static function printBrochure(Siting $siting, $company, $areaData, $rotation, $northRotation = 0, $dualOccupancy = false)
    {
        if ($company) {
            $viewName = 'pdf.sitings.' . Str::slug($company->name);

            if ($dualOccupancy && view()->exists($viewName . '-dual')) {
                $viewName .= '-dual';
            }
        }
        if (!isset($viewName) || !view()->exists($viewName)) {
            $viewName = 'pdf.sitings.general';
        }

        $view = view($viewName, [
            'siting' => $siting,
            'areaData' => $areaData,
            'sitingImage' => $siting->imageURL,
            'company' => $company ?? null,
            'rotation' => $rotation,
            'northRotation' => (is_numeric($northRotation) && $northRotation != 0) ? $northRotation : $rotation
        ]);

        return PDFRender::html2pdf($view);
    }

    /**
     * @param Siting $siting
     */
    static function printEngineering(Siting $siting)
    {
        /**
         * Resign the engineering page ID so that it can be loaded correctly
         */
        $engineering = file_get_contents(
            File::storageUrl($siting->engineering),
            false,
            stream_context_create(
                array("ssl" => array("verify_peer"=>false, "verify_peer_name"=>false))
            )
        );

        $engineering = self::resignAWSUrl($engineering, "src=\"", "\"/>");
        $engineering = self::resignAWSUrl($engineering, "href=\"", "\"/>");

        return PDFRender::html2pdf_raw($engineering);
    }

    static function resignAWSUrl($html, $startTag, $endTag) {
        /** HTML format is:
        [...]
        startTag<URLCONTENTS>endTag
        [...]
        **/

        if (strpos($html, $startTag) !== false) {
            $htmlPieces   = explode($startTag, $html);
            $urlPieces    = explode($endTag,   $htmlPieces[1]);

            $fullPath     = explode("?", $urlPieces[0])[0];
            $relativePath = substr($fullPath, strpos($fullPath, "documents"));

            // process the URL signature
            $urlPieces[0] = File::storageTempUrl($relativePath, now()->addDay(6));

            return $htmlPieces[0] . $startTag . implode($endTag, $urlPieces);
        }

        return $html;
    }

    /**
     * @param Siting $siting
     */
    static function printNearmap(Siting $siting)
    {
        if (!$siting->nearmap) {
            return null;
        }

        /**
         * Fetch the nearmap URL
         */
        $nearmap = file_get_contents(
            File::storageUrl($siting->nearmap),
            false,
            stream_context_create(
                array("ssl" => array("verify_peer"=>false, "verify_peer_name"=>false))
            )
        );

        return PDFRender::html2pdf_raw($nearmap);
    }


    private function replicatePlan(HasOne $plans, Siting $siting, DrawerData $drawerData)
    {
        $plans->each(function ($file) use ($siting, $drawerData) {
            $newFile = $file->replicate();
            $newFile->siting()->associate($siting);
            $newFile->save();

            $file->pages()->each(function ($page) use ($newFile, $siting, $drawerData) {
                $newPage = $page->replicate();
                $newPage->file()->associate($newFile);
                $newPage->save();

                if ($drawerData->page_id) {
                    $pageNumber = $siting->page->page ?? null;
                    if ($pageNumber && $newPage->page == $pageNumber) {
                        $drawerData->page()->associate($newPage);
                        $drawerData->save();
                    }
                }
            });
        });
    }
}
