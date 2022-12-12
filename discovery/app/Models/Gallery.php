<?php

namespace App\Models;

/**
 * Class Gallery
 * @property int house_id
 * @property string path
 * @property string thumb
 * @property string small
 * @property string medium
 * @property string large
 * @property string file_hash
 * @property House house
 * @method static Gallery firstOrCreate($id)
 */
class Gallery extends HouseEntity
{
    protected static $storageFolder = 'gallery';

    use ResizeImageTrait;

    protected $fillable = [
        'house_id', 'path', 'thumb', 'small', 'medium', 'large', 'file_hash'
    ];

    protected $hidden = ['file_hash', 'path', 'thumb', 'small', 'medium', 'large'];

    protected $appends = ['mediumImage', 'largeImage', 'thumbImage'];

    public function house()
    {
        return $this->belongsTo(House::class);
    }
}
