<?php

namespace App\Models\Sitings;

use App\Jobs\Sitings\{SendBuilderIssueFloorplanJob, SendIssueFloorplanJob, SendContractorIssueRejectedFloorplanJob};
use Illuminate\Database\Eloquent\{Builder as EloquentBuilder, Model};

/**
 * Class FloorplanFiles
 * @property int created_at
 * @property int floorplan_id
 * @property int status
 * @property string issue_text
 * @property Floorplan floorplan
 * @method static unreviewedIssues(...$args)
 */
class FloorplanIssues extends Model
{
    protected $table = 'sitings_floorplan_issues';
    public $timestamps = false;

    protected $fillable = ['floorplan_id', 'issue_text', 'status', 'created_at'];

    const STATUS_CREATED = 0;
    const STATUS_ACCEPTED = 1;
    const STATUS_REJECTED = 2;

    protected static function boot()
    {
        parent::boot();
        static::creating(function (FloorplanIssues $issue) {
            $issue->fill([
                'created_at' => time(),
                'status'     => self::STATUS_CREATED
            ]);
        });

        static::created(function (FloorplanIssues $issue) {
            dispatch(new SendIssueFloorplanJob($issue->floorplan_id, $issue->issue_text, auth()->id()));
        });

        static::updated(function (FloorplanIssues $issue) {
            $status     = $issue->getAttributeFromArray('status');
            $floorplan  = $issue->floorplan;
            $origStatus = $issue->getOriginal('status');

            if ($status == self::STATUS_ACCEPTED && $status !== $origStatus) {
                $floorplan->insertNote('Issue added: ' . $issue->issue_text);
                dispatch(new SendBuilderIssueFloorplanJob($floorplan->getKey(), $issue->issue_text));
            }

            if ($status == self::STATUS_REJECTED && $status !== $origStatus) {
                dispatch(new SendContractorIssueRejectedFloorplanJob($floorplan->getKey(), $issue->issue_text));
            }
        });
    }

    function floorplan()
    {
        return $this->belongsTo(Floorplan::class);
    }

    function scopeUnreviewedIssues(EloquentBuilder $b)
    {
        return $b->where($b->qualifyColumn('status'), FloorplanIssues::STATUS_CREATED);
    }
}