<?php

namespace App\Models\Sitings;

use App\Models\{
    Company, File, Range
};
use App\Jobs\Sitings\{
    SendActiveFloorplanNotificationJob,
    SendApprovalRequiredFloorplanNotificationJob,
    SendContractorIssueRejectedFloorplanJob
};
use Illuminate\Database\Eloquent\{Model, SoftDeletes, Builder as EloquentBuilder};
use Illuminate\Support\Collection;

/**
 * Class Floorplan
 * @property string name
 * @property string status
 * @property string url
 * @property string updated_at
 * @property string svgPath (accessor)
 * @property string svgUrl (accessor)
 * @property int to_mm_factor
 * @property int range_id
 * @property int state_id
 * @property int created_at
 * @property int live_date
 * @property int history
 * @property Company company
 * @property Range range
 * @property FloorplanFiles files
 *
 * @property integer company_id
 *
 * @method static byCompany(...$args)
 * @method static byStates(...$args)
 */
class Floorplan extends Model
{
    function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        $user = auth()->user();
        if ($user && $user->can('contractor')) {
            $this->makeVisible(['url', 'is_live']);
        };
    }

    use DeleteStorageFilesTrait, CustomFiltersTrait, SoftDeletes;
    const storageFolder = 'floorplan_svg';
    const storageFileFields = ['url'];

    protected $table = 'house_svgs';
//    protected $dateFormat = 'U';

    protected $fillable = [
        'range_id', 'name', 'url', 'to_mm_factor', 'area_data',
        'status', 'is_live', 'live_date', 'history', 'updated_at'
    ];

    protected $hidden = ['url', 'is_live'];

    protected $appends = ['company_id'];

    protected $attributes = [
        'status'  => self::STATUS_ATTENTION,
        'history' => 0
    ];

    protected $guarded = ['status', 'history', 'is_live', 'url', 'name'];
    protected static $filteredRelations = ['range.name', 'company.name'];

    protected $casts = [
        'updated_at' => 'timestamp',
        'created_at' => 'timestamp',
        'deleted_at' => 'timestamp',
    ];

    const STATUS_ATTENTION = 'Attention';
    const STATUS_ACTIVE = 'Active';
    const STATUS_IN_PROGRESS = 'In Progress';
    const STATUS_AWAITING_APPROVAL = 'Awaiting Approval';

    const HISTORY_EMPTY = 0;
    const HISTORY_EXISTS = 1;
    const HISTORY_EXISTS_UNREAD = 2;

    public $timestamps = true;

    public function company()
    {
        return $this->hasOneThrough(
            Company::class,
            Range::class,
            'id',
            'id',
            'range_id',
            'cid'
        );
    }

    public function range()
    {
        return $this->belongsTo(Range::class);
    }

    function floorplanHistory()
    {
        return $this->hasMany(FloorplanHistory::class);
    }

    function files()
    {
        return $this->hasMany(FloorplanFiles::class);
    }

    function issues()
    {
        return $this->hasMany(FloorplanIssues::class);
    }

    /**
     * @param EloquentBuilder $b
     * @param Collection $ids
     * @return EloquentBuilder
     */
    function scopeByStates(EloquentBuilder $b, Collection $ids)
    {
        return $b->whereIn($b->qualifyColumn('state_id'), $ids);
    }

    function getHasUnreviewedIssuesAttribute()
    {
        return $this->issues()->unreviewedIssues()->exists();
    }

    protected static function boot()
    {
        parent::boot();
        static::deleting(function (Floorplan $f) {
            $f->files()->each(function (FloorplanFiles $ff) {
                $ff->delete();
            });
        });

        static::addGlobalScope('hideDrafts', function (EloquentBuilder $b) {
            $b->where($b->qualifyColumn('status'), '<>', '');
        });

        static::saved(function (Floorplan $f) {
            $liveStatus = $f->getAttributeFromArray('is_live');
            if ($liveStatus !== null && $liveStatus !== $f->getOriginal('is_live')) {
                $f->insertNote($liveStatus ? 'Landconnect made updates live' : 'Landconnect removed floorplan from live');
            }

            $planStatus = $f->getAttributeFromArray('status');

            if ($planStatus == self::STATUS_ACTIVE && $planStatus !== $f->getOriginal('status')) {
                dispatch(new SendActiveFloorplanNotificationJob($f->getKey()));
            }

            if ($planStatus == self::STATUS_AWAITING_APPROVAL && $planStatus !== $f->getOriginal('status')) {
                dispatch(new SendApprovalRequiredFloorplanNotificationJob($f->getKey()));
            }
        });

        static::saving(function (Floorplan $f){
            if ($f->url && $f->url != $f->getOriginal('url')) {
                //$f->area_data = null;
            }
        });
    }

    function updateHistoryStatus()
    {
        if ($this->floorplanHistory()->exists()) {
            $status = $this->floorplanHistory()
                           ->unread()
                           ->exists()
                ? self::HISTORY_EXISTS_UNREAD
                : self::HISTORY_EXISTS;
        } else {
            $status = self::HISTORY_EMPTY;
        }

        $this->update(['history' => $status]);
    }

    function insertNote($note, $viewed = 0)
    {
        $this->floorplanHistory()->create(compact('note', 'viewed'));
    }

    function getCompanyIdAttribute()
    {
        return $this->company()->first([$this->company()->getQualifiedForeignKeyName()])->id;
    }

    function getSvgURLAttribute()
    {
        $svgPath = $this->svgPath;

        if (app()->environment('production')) {
            File::setDisk('s3-footprints');
        }
        return $svgPath ? File::storageTempUrl($svgPath, now()->addDay(1)) : null;
    }

    // floorplans/[COMPANY_KEY]/[STATE.ABBREV]/[RANGE.FOLDER]/[HOUSE_NAME].svg
    function getSvgPathAttribute()
    {
        $path = $this->url;
        return $path ? $this->getStoragePath() . "/" . $path : null;
    }

    function getStoragePath()
    {
        $pathPieces = [
            "floorplans",
            $this->range->builderCompany->ckey,
            strtolower($this->range->state->abbrev),
            strtolower($this->range->folder)
        ];
        return implode('/', array_filter($pathPieces));
    }

    function updateIssuesStatus($status)
    {
        if ($status == FloorplanIssues::STATUS_REJECTED) {

            $issues = $this->issues()
                           ->unreviewedIssues()
                           ->get()
                           ->pluck('issue_text')
                           ->all();

            dispatch(new SendContractorIssueRejectedFloorplanJob($this->getKey(), join("\n", $issues)));
        }

        $this->issues()
             ->unreviewedIssues()
             ->update(['status' => $status]);

    }

    /**
     * @param array $sortOptions
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    static function listFloorplans(array $sortOptions)
    {
        /** @var User $user */
        $user            = auth()->user();
        $floorplansQuery = Floorplan::query();

        if ($user->has_portal_access == User::PORTAL_ACCESS_BUILDER) {
            $companyId = $user->company_id;
            $floorplansQuery->withoutGlobalScope('hideDrafts');
            $floorplansQuery->whereHas('company', function (EloquentBuilder $b) use ($companyId) {
                $b->byId($companyId);
            });
        }

        if ($user->has_portal_access == User::PORTAL_ACCESS_CONTRACTOR) {
            $floorplansQuery->whereHas('files');
        }

        $floorplansQuery->customFilters($sortOptions);

        $floorplansQuery->select($floorplansQuery->qualifyColumn('*'));

        return $floorplansQuery->paginate(30);
    }
}
