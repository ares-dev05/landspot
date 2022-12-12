<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;

/**
 * EstateShortList class
 * @property int id
 * @property int invited_user_id
 * @property int estate_id
 * @property InvitedUser invitedUser
 * @property Estate estate
 * @property ShortList shortList
 * @method static byInvitedUser(...$args)
 */
class EstateShortList extends Model
{
    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];
    /**
     * Determines if a table has a timestamp
     *
     * @var boolean
     */
    public $timestamps = false;
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    function invitedUser()
    {
        return $this->belongsTo(InvitedUser::class);
    }
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    function estate()
    {
        return $this->belongsTo(Estate::class);
    }
    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    function shortList()
    {
        return $this->hasMany(ShortList::class);
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
}
