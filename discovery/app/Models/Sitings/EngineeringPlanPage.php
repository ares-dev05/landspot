<?php

namespace App\Models\Sitings;

use App\Models\File;
use Illuminate\Database\Eloquent\Model;

/**
 * Class EngineeringPlanPage
 * @property int file_id
 * @property int page
 * @property int width
 * @property int height
 * @property string thumb
 * @property EngineeringPlan file
 * @property DrawerData drawerData
 */
class EngineeringPlanPage extends Model
{
    use DeleteStorageFilesTrait;

    const storageFileFields = ['thumb'];

    static $storageFolder = 'engineering_plan_pages';

    protected $table    = 'sitings_engineering_plan_pages';
    protected $fillable = [
        'file_id', 'page', 'width', 'height', 'thumb'
    ];
    protected $hidden  = ['thumb', 'file_id'];
    protected $appends = ['image'];


    public $timestamps = false;

    protected static function boot()
    {
        parent::boot();

        static::deleted(function (EngineeringPlanPage $item) {
            $item->drawerData()->update([
                'page_id' => null
            ]);
        });
    }

    function getImageAttribute()
    {
        $path = $this->thumb;
        return $path ? File::storageTempUrl($path, now()->addDay(6)) : null;
    }

    public function file()
    {
        return $this->belongsTo(EngineeringPlan::class, 'file_id');
    }

    public function drawerData()
    {
        return $this->hasMany(DrawerData::class, 'page_id');
    }
}
