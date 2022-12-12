<?php

namespace App\Models;

use App\Models\Sitings\Floorplan;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Support\Str;

/**
 * Class Range
 * @property string inclusions
 * @property int id
 * @property int cid
 * @property int state_id
 * @property string name
 * @property string folder
 * @property Company builderCompany
 * @property House house
 * @property \DateTime deleted_at
 * @property State state
 * @method static byName(...$args)
 */
class Range extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'cid', 'state_id', 'name', 'inclusions', 'folder', 'multihouse', 'exclusive'
    ];

    protected $hidden = ['deleted_at', 'cid', 'folder', 'multihouse', 'exclusive'];
    protected $attributes = [
        'folder' => ''
    ];

    public $timestamps = false;

    protected $table = 'house_ranges';

    /**
     * The "booting" method of the model.
     *
     * @return void
     */
    protected static function boot()
    {
        parent::boot();
        static::deleting(function (Range $range) {
            $range->house()->each(function (House $house) {
                $house->delete();
            });
        });
        static::creating(function (Range $range) {
            if (!$range->folder || $range->folder == '') {
                $range->folder = Str::slug($range->name, '_');
            }
        });
    }

    public function state()
    {
        return $this->belongsTo(State::class, 'state_id', 'id');
    }

    public function builderCompany()
    {
        return $this->belongsTo(Company::class, 'cid', 'id');
    }

    public function getBuilderCompanyIdAttribute()
    {
        return $this->builderCompany()->first()->id;
    }

    function house()
    {
        return $this->hasMany(House::class);
    }

    public function floorplans()
    {
        return $this->hasMany(Floorplan::class);
    }

    public function getInclusionsAsArrayAttribute()
    {
        $inclusions = preg_split('/[\r\n]+/', $this->inclusions);

        return array_filter($inclusions, function ($item) {
            return mb_strlen($item) && !preg_match('/^\s+$/', $item);
        });
    }

    /**
     * @param EloquentBuilder $b
     * @param $name
     * @return EloquentBuilder
     */
    function scopeByName(EloquentBuilder $b, $name)
    {
        return $b->where('name', 'like', $name);
    }

    /**
     * @param EloquentBuilder $b
     * @param $name
     * @return EloquentBuilder
     */
    function scopeByFolder(EloquentBuilder $b, $name)
    {
        return $b->where('folder', 'like', $name);
    }

    /**
     * @param EloquentBuilder $b
     * @param $stateId
     * @param $companyId
     * @return EloquentBuilder
     */
    function scopeByCompanyState(EloquentBuilder $b, $stateId, $companyId)
    {
        return $b->where(['state_id' => $stateId, 'cid' => $companyId]);
    }

    /**
     * @param EloquentBuilder $b
     * @param int $companyId
     * @return EloquentBuilder
     */
    function scopeByCompanyId(EloquentBuilder $b, $companyId)
    {
        return $b->where('cid', $companyId);
    }
}
