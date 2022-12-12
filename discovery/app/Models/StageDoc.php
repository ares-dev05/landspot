<?php

namespace App\Models;

use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;

/**
 * Class StageDoc
 * @property int stage_id
 * @property int type
 * @property string path
 * @property string name
 * @property string fileURL
 * @property Stage stage
 * @property StageDocPage pages
 * @method static findOrFail($id)
 */
class StageDoc extends Model implements FileStorageInterface
{
    use FileStorageTrait;

    protected $table = 'stage_docs';
    protected $fillable = ['stage_id', 'path', 'type', 'name'];
    protected $appends = ['viewURL'];

    public $timestamps = false;
    protected $hidden = ['path', 'stage_id'];

    const types = [
        'plan_of_subdivision' => 0,
        'engineering_report'  => 1,
        'mcp'                 => 2,
        'other'               => 3
    ];

    public function stage()
    {
        return $this->belongsTo(Stage::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function (StageDoc $stageDoc) {
            $stageDoc->pages()->each(function (StageDocPage $f) {
                $f->delete();
            });
        });
    }

    public function pages()
    {
        return $this
            ->hasMany(StageDocPage::class, 'file_id')
            ->orderBy('id');
    }

    function scopePosDocument(EloquentBuilder $b)
    {
        return $b->where($b->qualifyColumn('type'), StageDoc::types['plan_of_subdivision']);
    }

    function getViewURLAttribute()
    {
        return route('landspot.export-stage-doc', ['stageDoc' => $this->id]);
    }

    function getFileURLAttribute()
    {
        return $this->path ? ImageFromPDF::storageTempUrl($this->path, now()->addDay(2)) : null;
    }

    static function getFilesStorageFields()
    {
        return ['path'];
    }

    /**
     * @throws Exception
     */
    function convertFile()
    {
        $pages = [];
        try {
            $tempFile = File::cloneFileToTempFolder($this->path);
            $name = basename($tempFile);
            $pageFiles = ImageFromPDF::storePagesToTempFolder($name);


            for ($i = 0; $i < count($pageFiles); $i++) {
                $page = $pageFiles[$i];

                $pages[] = [
                    'page'   => $i + 1,
                    'thumb'  => ImageFromPDF::moveTemporaryFileToStorage(
                        $page['filename'],
                        StageDocPage::$storageFolder
                    ),
                    'width'  => $page['size']['width'],
                    'height' => $page['size']['height']
                ];
            }

            if ($pages) {
                /** @var StageDoc $doc */
                $this->pages()->each(function (StageDocPage $page) {
                    $page->delete();
                });

                $this->pages()->createMany($pages);
            }
            File::deleteFile($tempFile);
        } catch (Exception $e) {
            foreach ($pages as $page) {
                ImageFromPDF::deleteFile($page['thumb']);
            }
            throw $e;
        }
    }

    /**
     * @param Stage $stage
     * @param $file
     * @param $type
     * @throws Exception
     */
    static function storeByStage(Stage $stage, $file, $type)
    {
        $document = File::storeToTempFolder($file);
        $path = File::moveTemporaryFileToStorage($document['name'], 'stage_packages');

        try {
            $stage
                ->stageDocs()
                ->updateOrCreate(
                    ['type' => $type],
                    [
                        'path' => $path,
                        'name' => $document['fileName']
                    ]
                );
        } catch (Exception $e) {
            File::deleteFile($path);
            throw $e;
        }
    }
}
