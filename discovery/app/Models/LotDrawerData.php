<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;

/**
 * Class LotDrawerData
 * @property int id
 * @property int lot_id
 * @property int page_id
 * @property int is_completed
 * @property int rotation
 * @property int view_scale
 * @property string edges
 * @property string easements
 * @property string path
 * @property Lot lot
 * @property StageDocPage page
 */
class LotDrawerData extends Model
{
    use FileStorageTrait;

    const fileStorageFields = ['path'];

    static $storageFolder = 'lot_drawer_images';

    protected $fillable = [
        'lot_id', 'page_id', 'edges', 'rotation', 'easements', 'is_completed', 'view_scale', 'path'
    ];

    protected $hidden = [
        'id', 'lot_id'
    ];

    public $timestamps = false;

    function getLotImageAttribute()
    {
        $path = $this->path;
        return $path ? File::storageUrl($path) : null;
    }

    function lot()
    {
        return $this->belongsTo(Lot::class);
    }

    function page()
    {
        return $this->belongsTo(StageDocPage::class, 'page_id');
    }

    /**
     * @param EloquentBuilder $b
     * @return $this
     */
    function scopeCompleted(EloquentBuilder $b)
    {
        return $b->where('is_completed', 1);
    }

    static function getFilesStorageFields()
    {
        return static::fileStorageFields;
    }
}
