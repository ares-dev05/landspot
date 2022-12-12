<?php

namespace App\Models\Sitings;

use App\Models\File;
use Exception;
use FileHelper;
use Illuminate\Database\Eloquent\Model;

/**
 * Class ReferencePlans
 * @property int id
 * @property int siting_id
 * @property int created_at
 * @property string path
 * @property string name
 * @property string fileURL
 * @property Siting siting
 * @property ReferencePlanPage pages
 */
class EngineeringPlan extends Model
{
    use DeleteStorageFilesTrait;

    const storageFileFields = ['path'];
    static $storageFolder = 'engineering_plan';

    public $timestamps  = false;
    protected $table    = 'sitings_engineering_plans';
    protected $fillable = ['siting_id', 'path', 'name', 'created_at'];
    protected $hidden   = ['path', 'siting_id'];
    protected $appends  = ['viewURL'];

    protected static function boot()
    {
        parent::boot();

        static::deleting(function (EngineeringPlan $doc) {
            $doc->pages()->each(function (EngineeringPlanPage $p) {
                $p->delete();
            });
        });

        static::saving(function (EngineeringPlan $doc) {
            $original = $doc->getOriginal();

            foreach (self::storageFileFields as $field) {
                if (isset($original[$field]) && $doc->{$field} != $original[$field]) {
                    $doc->pages()->each(function (EngineeringPlanPage $p) {
                        $p->delete();
                    });
                    $doc->convertFile();
                }
            }

            return true;
        });

        static::creating(function (EngineeringPlan $doc) {
            $doc->created_at = time();
        });

        static::created(function (EngineeringPlan $doc) {
            $doc->convertFile();
        });
    }

    public function pages()
    {
        return $this
            ->hasMany(EngineeringPlanPage::class, 'file_id')
            ->orderBy('id');
    }

    function siting()
    {
        return $this->belongsTo(Siting::class);
    }

    function getFileURLAttribute()
    {
        return $this->path ? File::storageTempUrl($this->path, now()->addDay(2)) : null;
    }

    function getViewURLAttribute()
    {
        return route('export-doc-engineering', ['engineeringPlan' => $this->id]);
    }


    /**
     * @throws Exception
     */
    function convertFile()
    {
        FileHelper::convertFile($this->path, ReferencePlanPage::$storageFolder, $this);
    }
}
