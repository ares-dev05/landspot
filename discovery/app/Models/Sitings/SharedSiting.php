<?php

namespace App\Models\Sitings;

use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Siting
 * @property int id
 * @property int siting_id
 * @property int user_id
 * @property User user
 * @property Siting siting
 */
class SharedSiting extends Model
{
    public $timestamps = false;
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function siting()
    {
        return $this->belongsTo(Siting::class, 'siting_id', 'id');
    }

    function scopeBySitingId(EloquentBuilder $b, $id)
    {
        return $b->where($b->qualifyColumn('siting_id'), $id);
    }
}
