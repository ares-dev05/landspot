<?php

namespace Landconnect\Blog\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Media
 *
 * @method static Media findOrFail($id)
 * @method static Media find($id)
 * @method static Media create($args)
 * @property int id
 * @property MediaFile media
 */
class Media extends Model
{
    protected $table = 'blog_media';
    /**
     * The relations to eager load on every query.
     *
     * @var array
     */
    protected $appends = ['media'];

    public $timestamps = false;

    public function __construct(array $attributes = [])
    {
        $this->connection = Connection::i()->getConnection();

        return parent::__construct(...func_get_args());
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function (Media $m) {
            $m->media()->each(function (MediaFile $f) {
                $f->delete();
            });
        });
    }

    /**
     * Get all of the media files.
     */
    public function media()
    {
        return $this->morphMany(MediaFile::class, 'mediable');
    }

    function getMediaAttribute()
    {
        return $this->media()->count() ? $this->media()->first() : $this->media()->make();
    }
}
