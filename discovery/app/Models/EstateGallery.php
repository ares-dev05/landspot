<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class EstateGallery
 * @property int id
 * @property int estate_id
 * @property string path
 * @property string name
 * @property string file_url
 * @property Estate estate
 *
 */
class EstateGallery extends Model
{
    protected $guarded = [];

    public $timestamps = false;

    protected $appends = ['file_url'];

    function getFileURLAttribute()
    {
        return $this->path ? File::storageUrl($this->path) : null;
    }

    // Relations
    function estate()
    {
        return $this->belongsTo(Estate::class);
    }

    /**
     * Delete file from database and Storage
     * @return bool|null
     * @throws \Exception
     */
    function deleteFile()
    {
        File::deleteFile($this->path);
        return $this->delete();
    }

}
