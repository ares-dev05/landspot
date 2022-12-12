<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
/**
 * Class Floorplan
 * @property int floor
 * @property float size
 * @property int house_id
 * @method static Floorplan firstOrCreate($args)
 */
class Floorplan extends HouseEntity
{
    protected static $storageFolder = 'floorplan';

    use ResizeImageTrait;

    protected $fillable = [
        'house_id', 'path', 'size', 'thumb', 'small', 'medium', 'large', 'floor', 'file_hash'
    ];

    protected $hidden = ['file_hash', 'path', 'thumb', 'small', 'medium', 'large'];

    protected $appends = ['mediumImage', 'largeImage', 'thumbImage'];

    public function house()
    {
        return $this->belongsTo(House::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::addGlobalScope('defaultSort', function (EloquentBuilder $b) {
            $b->orderBy('floor');
        });
    }
}
