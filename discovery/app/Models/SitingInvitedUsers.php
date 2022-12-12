<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\Relations\Pivot;
use App\Models\Sitings\Siting;

/**
 * Class SitingInvitedUsers
 * @property int id
 * @property int invited_user_id
 * @property int siting_id
 * @property int company_id
 * @property Siting siting
 * @property InvitedUser invitedUser
 * @property Company company
 *
 * @method static byCompany()
 * @method static bySiting()
 * @method static byInvitedUser()
 */
class SitingInvitedUsers extends Pivot
{
    public $timestamps = false;

    protected $table = 'siting_invited_users';
    protected $fillable = ['siting_id', 'invited_user_id', 'company_id'];
    protected $hidden = ['id', 'siting_id', 'invited_user_id', 'company_id'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function (SitingInvitedUsers $pivot) {
            if (!$pivot->company_id) {
                $pivot->company_id = $pivot->siting->user->company_id;
            }
        });

        static::deleted(function (SitingInvitedUsers $pivot) {
            if (SitingInvitedUsers::where('siting_id', $pivot->siting_id)->doesntExist()) {
                Siting::where('id', $pivot->siting_id)->update(['status' => Siting::STATUS_DRAFT]);
            }
        });
    }

    function siting()
    {
        return $this->belongsTo(Siting::class, 'siting_id');
    }

    function invitedUser()
    {
        return $this->belongsTo(InvitedUser::class, 'invited_user_id');
    }

    function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    /**
     * @param EloquentBuilder $b
     * @param int $companyId
     * @return EloquentBuilder
     */
    function scopeByCompany(EloquentBuilder $b, $companyId)
    {
        return $b->where('company_id', $companyId);
    }

    /**
     * @param EloquentBuilder $b
     * @param int $sitingId
     * @return EloquentBuilder
     */
    function scopeBySiting(EloquentBuilder $b, $sitingId)
    {
        return $b->where('siting_id', $sitingId);
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
