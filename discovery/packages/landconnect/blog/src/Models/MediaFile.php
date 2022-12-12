<?php

namespace Landconnect\Blog\Models;

use App\Models\ResizeImageTrait;
use Illuminate\Database\Eloquent\Model;

/**
 * Class MediaFile
 *
 * @method static MediaFile findOrFail($id)
 * @method static MediaFile find($id)
 * @method static MediaFile create($args)
 * @property int id
 * @property int mediable_id
 * @property string mediable_type
 * @property string path
 * @property string name
 * @property string thumb
 * @property string small
 */
class MediaFile extends Model
{
    protected $table = 'blog_media_files';

    protected static $storageFolder = 'blog_media';

    use ResizeImageTrait;

    function __construct(array $attributes = [])
    {
        self::$imageSizes = ['thumb', 'small'];

        $this->connection = Connection::i()->getConnection();

        return parent::__construct(...func_get_args());
    }

    protected $fillable = [
        'path', 'name', 'thumb', 'small', 'mediable_id', 'mediable_type'
    ];
    protected $hidden = ['path', 'thumb', 'small', 'mediable_id', 'mediable_type'];

    public $timestamps = false;

    protected $appends = ['thumbImage', 'smallImage'];

    /**
     * Get all of the owning mediable models.
     */
    public function mediable()
    {
        return $this->morphTo();
    }
}
