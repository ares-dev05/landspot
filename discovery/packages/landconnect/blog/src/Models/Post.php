<?php

namespace Landconnect\Blog\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\{Model, Builder};
use Illuminate\Support\Str;

/**
 * Class Post
 *
 * @method static Post findOrFail($id)
 * @method static Post find($id)
 * @method static Post create($args)
 * @method static Builder select($args)
 * @property int id
 * @property int user_id
 * @property int thumb_id
 * @property int topic_id
 * @property int is_blog
 * @property string title
 * @property string description
 * @property string content
 * @property string slug
 * @property User user
 * @property Media thumb
 * @property Topic topic
 */
class Post extends Model
{
    protected $table = 'blog_posts';
    protected $dateFormat = 'U';
    public $timestamps = true;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'content',
        'is_blog',
        'slug',
        'thumb_id',
        'topic_id',
    ];

    protected $hidden = ['thumb_id', 'user_id', 'topic_id'];

    /**
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $dates = [
        'created_at', 'updated_at'
    ];

    public function __construct(array $attributes = [])
    {
        $this->connection = Connection::i()->getConnection();

        return parent::__construct(...func_get_args());
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function (Post $post) {
            $post->user_id = auth()->user()->id;
        });
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * @param Builder $b
     * @param $id
     * @return Builder
     */
    function scopeByTopic(Builder $b, $id)
    {
        return $b->where('topic_id', $id);
    }

    /**
     * @param Builder $b
     * @param $id
     * @return Builder
     */
    function scopeByThumb(Builder $b, $id)
    {
        return $b->where('thumb_id', $id);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function topic()
    {
        return $this->belongsTo(Topic::class, 'topic_id');
    }

    /**
     * Return the post's thumbnail
     */
    public function thumb()
    {
        return $this->belongsTo(Media::class);
    }

    public function getExcerptAttribute()
    {
        return $this->excerpt();
    }

    public function getRelatedPostsAttribute()
    {
        return Post::with(['topic:id,title', 'thumb'])
            ->where('topic_id', $this->topic_id)
            ->where('is_blog', $this->is_blog)
            ->where('id', '!=', $this->id)
            ->orderBy('id', 'desc')
            ->take(2)
            ->get();
    }

    /**
     * return the excerpt of the post content
     * @param int $limit
     * @return string
     */
    public function excerpt($limit = 150)
    {
        return Str::limit(strip_tags($this->content), $limit);
    }

    public function hasThumb()
    {
        return filled($this->thumb_id);
    }
}
