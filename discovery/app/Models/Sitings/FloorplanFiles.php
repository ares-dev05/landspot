<?php

namespace App\Models\Sitings;

use Illuminate\Database\Eloquent\Model;

/**
 * Class FloorplanFiles
 * @property int created_at
 * @property int floorplan_id
 * @property string name
 * @property string note
 * @property string path
 */
class FloorplanFiles extends Model
{
    use DeleteStorageFilesTrait;
    const storageFolder = 'floorplan_files';
    protected $table = 'sitings_floorplan_files';
    public $timestamps = false;
    protected $hidden = ['path'];

    const storageFileFields = ['path'];

    protected $fillable = ['floorplan_id', 'path', 'note', 'name', 'created_at'];

    function floorplan()
    {
        return $this->belongsTo(Floorplan::class);
    }

    function getFileUrlAttribute()
    {
        return route('download.floorplan', ['file' => $this->getKey()], false);
    }
}