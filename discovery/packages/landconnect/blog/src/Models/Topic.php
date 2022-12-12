<?php

namespace Landconnect\Blog\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

/**
 * Class Topic
 *
 * @method static Topic findOrFail($id)
 * @method static Topic find($id)
 * @method static Topic create($args)
 * @method static Topic has($args)
 * @property int id
 * @property string title
 * @property Post posts
 */
class Topic extends Model
{
    protected $table = 'blog_topics';
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['title'];

    public function __construct(array $attributes = [])
    {
        $this->connection = Connection::i()->getConnection();

        return parent::__construct(...func_get_args());
    }

    public function posts()
    {
        return $this->hasMany(Post::class, 'topic_id');
    }

    /**
     * Scope a query to search posts
     * @param Builder $b
     * @param string $title
     * @return Builder
     */
    public function scopeByTitle(Builder $b, $title)
    {
        return $title == ''
            ? $b
            : $b->where('title', 'like', '%' . $title . '%');
    }
}
