<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class LotDrawerTheme
 * @property int id
 * @property int stage_id
 * @property string theme
 * @property string path
 * @property Stage stage
 */
class LotDrawerTheme extends Model
{
    static $storageFolder = 'lot_drawer_backgrounds';

    protected $fillable = [
        'stage_id', 'theme', 'path'
    ];

    protected $hidden = [
        'id', 'stage_id'
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['background_image'];

    public $timestamps = false;

    protected static function boot()
    {
        parent::boot();

        static::deleted(function (LotDrawerTheme $item) {
            if ($item->path) {
                File::deleteFile($item->path);
            }
        });

        static::saved(function (LotDrawerTheme $item) {
            /** @var \Illuminate\Database\Eloquent\Model $item */
            $original     = $item->getOriginal();
            $originalPath = $original['path'] ?? '';

            if ($item->path != $originalPath && $originalPath != '') {
                File::deleteFile($original['path']);
            }

            return true;
        });
    }

    function getBackgroundImageAttribute()
    {
        $path = $this->path;
        return $path ? File::storageUrl($path) : null;
    }

    function stage()
    {
        return $this->belongsTo(Stage::class);
    }
}
