<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class StageDocPage
 * @property int file_id
 * @property int page
 * @property int width
 * @property int height
 * @property string thumb
 * @property StageDoc file
 * @property LotDrawerData lotDrawerData
 */
class StageDocPage extends Model
{
    static $storageFolder = 'stage_doc_pages';

    protected $table    = 'stage_doc_pages';
    protected $fillable = [
        'file_id', 'page', 'width', 'height', 'thumb'
    ];
    protected $hidden  = ['thumb', 'file_id'];
    protected $appends = ['image'];

    const fileFields = ['thumb'];

    public $timestamps = false;

    protected static function boot()
    {
        parent::boot();

        static::deleted(function (StageDocPage $item) {
            $item->lotDrawerData()->update([
                'page_id' => null
            ]);
            ImageWithThumbnails::deleteFile($item->thumb);
        });

        static::saved(function (StageDocPage $item) {
            /** @var \Illuminate\Database\Eloquent\Model $item */
            $original = $item->getOriginal();

            foreach (self::fileFields as $field) {
                if (isset($original[$field]) &&
                    $item->{$field} != $original[$field] &&
                    $original[$field] != '') {
                    ImageWithThumbnails::deleteFile($original[$field]);
                }
            }

            return true;
        });
    }

    function getImageAttribute()
    {
        $path = $this->thumb;
        return $path ? ImageWithThumbnails::storageUrl($path) : null;
    }

    public function file()
    {
        return $this->belongsTo(StageDoc::class, 'file_id');
    }

    public function lotDrawerData()
    {
        return $this->hasMany(LotDrawerData::class, 'page_id');
    }
}
