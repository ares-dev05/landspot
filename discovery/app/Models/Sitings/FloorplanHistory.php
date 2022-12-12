<?php


namespace App\Models\Sitings;


use Illuminate\Database\Eloquent\{Builder as EloquentBuilder, Model};

/**
 * Class FloorplanHistory
 * @property int created_at
 * @property string note
 * @property Floorplan floorplan
 * @method Unread()
 */
class FloorplanHistory extends Model
{
    protected $table = 'sitings_floorplans_history';
    protected $fillable = ['floorplan_id', 'created_at', 'note', 'viewed'];
    protected $hidden = ['floorplan_id'];
    public $timestamps = false;

    function floorplan()
    {
        return $this->belongsTo(Floorplan::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::addGlobalScope('defaultOrder', function (EloquentBuilder $b) {
            $b->orderByDesc($b->qualifyColumn('created_at'));
        });

        static::creating(function (FloorplanHistory $h) {
            if (!$h->getAttributeFromArray('created_at')) {
                $h->created_at = time();
            }
        });

        foreach (['created', 'deleted', 'updated'] as $e) {
            static::registerModelEvent($e, function (FloorplanHistory $h) {
                $h->floorplan->updateHistoryStatus();
            });
        }
    }

    function scopeUnread(EloquentBuilder $b)
    {
        return $b->where($b->qualifyColumn('viewed'), 0);
    }
}