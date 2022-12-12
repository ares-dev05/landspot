<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Option
 * @property House house
 * @method static Option firstOrCreate($id)
 */
class Option extends HouseEntity
{
    protected static $storageFolder = 'option';

    use ResizeImageTrait;

    protected $fillable = [
        'house_id', 'title', 'path', 'thumb', 'small', 'medium', 'large', 'file_hash'
    ];

    protected $hidden = ['file_hash', 'path', 'thumb', 'small', 'medium', 'large'];

    protected $appends = ['mediumImage', 'largeImage'];

    public function house()
    {
        return $this->belongsTo(House::class);
    }

}
