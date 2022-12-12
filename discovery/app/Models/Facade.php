<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder as EloquentBuilder;

/**
 * Class Facade
 * @method static Facade firstOrCreate($id)
 * @method static Facade findOrFail($id)
 * @property int house_id
 * @property string title
 * @property string path
 * @property string thumb
 * @property string small
 * @property string medium
 * @property string large
 * @property string file_hash
 * @property House house
 * @property LotPackage lotPackage
 */
class Facade extends HouseEntity
{
    protected static $storageFolder = 'facade';

    use ResizeImageTrait;

    protected $fillable = [
        'house_id', 'title', 'path', 'thumb', 'small', 'medium', 'large', 'file_hash'
    ];

    protected $hidden = ['file_hash', 'path', 'thumb', 'small', 'medium', 'large'];

    protected $appends = ['mediumImage', 'largeImage', 'thumbImage'];

    protected static function boot()
    {
        parent::boot();
        static::deleting(function (Facade $f) {
            $f->lotPackage()->each(function (LotPackage $o) {
                $o->delete();
            });
            $f->floorplanShortlist()->each(function (FloorplanShortList $sl){
               $sl->delete();
            });
        });

        static::addGlobalScope('defaultSort', function (EloquentBuilder $b) {
            $b->orderBy('title');
        });
    }

    public function house()
    {
        return $this->belongsTo(House::class);
    }

    public function lotPackage()
    {
        return $this->hasMany(LotPackage::class);
    }
    public function floorplanShortlist()
    {
        return $this->hasMany(FloorplanShortList::class);
    }

    function scopeById(EloquentBuilder $b, $id)
    {
        return $b->where($b->qualifyColumn('id'), $id);
    }
}
