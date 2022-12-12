<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;

/**
 * Class FloorplanShortList
 * @package App\Models
 * @property int id
 * @property int invited_user_id
 * @property int house_id
 * @property int facade_id
 * @property string created_at
 * @property string updated_at
 * @property Facade facade
 * @method static byInvitedUser(...$args)
 * @method static where(string $string, int $id)
 */
class FloorplanShortList extends Model
{
    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['house_name', 'facade_name'];

    //relations
    function invitedUser()
    {
        return $this->belongsTo(InvitedUser::class);
    }
    function house()
    {
        return $this->belongsTo(House::class);
    }

    function facade()
    {
        return $this->belongsTo(Facade::class);
    }

    /**
     * @param EloquentBuilder $b
     * @param int $userId
     * @return EloquentBuilder
     */
    function scopeByInvitedUser(EloquentBuilder $b, $userId)
    {
        return $b->where('invited_user_id', $userId);
    }

    // attributes
    /**
     *  Get the house name flag for the houses table.
     *
     * @return string
     */
    function getHouseNameAttribute()
    {
        return $this->facade()->first()->house->title;
    }
    /**
     * Get the facade name flag for the facades table.
     *
     * @return string
     */
    public function getFacadeNameAttribute()
    {
        return $this->facade()->first()->title;
    }
}
