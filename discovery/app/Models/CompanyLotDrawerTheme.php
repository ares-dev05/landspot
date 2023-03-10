<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class CompanyLotDrawerTheme
 * @property int id
 * @property int stage_id
 * @property string theme
 * @property string path
 * @property Company company
 */
class CompanyLotDrawerTheme extends Model
{
    use FileStorageTrait;

    const fileStorageFields = ['path'];

    static $storageFolder = 'lot_drawer_backgrounds';

    protected $fillable = [
        'company_id', 'theme', 'path'
    ];

    protected $hidden = [
        'id', 'company_id'
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['background_image'];

    public $timestamps = false;

    function getBackgroundImageAttribute()
    {
        $path = $this->path;
        return $path ? File::storageUrl($path) : null;
    }

    function company()
    {
        return $this->belongsTo(Company::class);
    }

    static function getFilesStorageFields()
    {
        return static::fileStorageFields;
    }
}
