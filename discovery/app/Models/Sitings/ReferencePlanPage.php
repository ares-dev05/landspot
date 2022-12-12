<?php

namespace App\Models\Sitings;

use App\Models\File;
use Illuminate\Database\Eloquent\Model;

/**
 * Class ReferencePlanPages
 * @property int file_id
 * @property int page
 * @property int width
 * @property int height
 * @property string thumb
 * @property ReferencePlan file
 * @property DrawerData drawerData
 */
class ReferencePlanPage extends Model
{
    use DeleteStorageFilesTrait;

    const storageFileFields = ['thumb'];

    static $storageFolder = 'reference_plan_pages';

    protected $table    = 'sitings_ref_plan_pages';
    protected $fillable = [
        'file_id', 'page', 'width', 'height', 'thumb'
    ];
    protected $hidden  = ['thumb', 'file_id'];
    protected $appends = ['image'];


    public $timestamps = false;

    protected static function boot()
    {
        parent::boot();

        static::deleted(function (ReferencePlanPage $item) {
            $item->drawerData()->update([
                'page_id' => null
            ]);
        });
    }

    function getImageAttribute()
    {
        $path = $this->thumb;
        return $path ? File::storageTempUrl($path, now()->addDay(2)) : null;
    }

    public function file()
    {
        return $this->belongsTo(ReferencePlan::class, 'file_id');
    }

    public function drawerData()
    {
        return $this->hasMany(DrawerData::class, 'page_id');
    }
}
