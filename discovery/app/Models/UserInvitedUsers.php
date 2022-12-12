<?php

namespace App\Models;

use App\Http\Controllers\Lotmix\Auth\UserInvitationTrait;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class UserInvitedUsers
 * @property int id
 * @property int invited_user_id
 * @property int user_id
 * @property int company_id
 * @property string invitation_token
 * @property string status
 * @property string updated_at
 * @property string created_at
 * @property string deleted_at
 * @property string accepted_invite_at
 * @property int email_type
 * @property int order
 * @property User landSpotUser
 * @property InvitedUser invitedUser
 * @property Company company
 *
 * @method static byColumns(...$args)
 * @method static byCompany(...$args)
 * @method static byLandSpotUser(...$args)
 * @method static byInvitedUser(...$args)
 * @method static byToken(...$args)
 * @method static byStatus(...$args)
 */
class UserInvitedUsers extends Pivot
{
    use SoftDeletes;

    const STATUS_PENDING  = 'pending';
    const STATUS_EXPIRED  = 'expired';
    const STATUS_CLAIMED  = 'claimed';
    const STATUS_BRIEF    = 'brief';

    const EMAIL_TYPES = [
        '24hours'  => 1,
        '48hours'  => 2,
        '96hours'  => 3
    ];

    protected $table = 'user_invited_users';
    protected $fillable = ['user_id', 'invited_user_id', 'company_id', 'invitation_token', 'status', 'order', 'accepted_invite_at', 'email_type'];

    protected $hidden = [
        'invitation_token', 'id'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function (UserInvitedUsers $user) {
            if (!$user->invitation_token) {
                $user->invitation_token = substr(md5(rand(0, 9) . $user->invitedUser->email . time()), 0, 32);
            }

            if(UserInvitedUsers::byInvitedUser($user->invitedUser->id)
                ->byStatus(UserInvitedUsers::STATUS_CLAIMED)->withTrashed()->count() > 0){
                $user->status = UserInvitedUsers::STATUS_CLAIMED;
            } elseif (!$user->status){
                $user->status = UserInvitedUsers::STATUS_PENDING;
            }

//            $user->email_type = UserInvitedUsers::EMAIL_TYPES['24hours'];
            if (!$user->company_id && $user->status !== self::STATUS_BRIEF) {
                $user->company_id = $user->landSpotUser->company->id;
            }
        });
    }

    function landSpotUser()
    {
        return $this->belongsTo(User::class, 'user_id');
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
     * @param string $status
     * @return EloquentBuilder
     */
    function scopeByStatus(EloquentBuilder $b, $status)
    {
        return $b->where('status', $status);
    }

    /**
     * @param EloquentBuilder $b
     * @param array $columns
     * @return EloquentBuilder
     */
    function scopeByColumns(EloquentBuilder $b, $columns)
    {
        return $b->where($columns);
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
     * @param int $userId
     * @return EloquentBuilder
     */
    function scopeByLandSpotUser(EloquentBuilder $b, $userId)
    {
        return $b->where('user_id', $userId);
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

    /**
     * @param EloquentBuilder $b
     * @param string $token
     * @return EloquentBuilder
     */
    function scopeByToken(EloquentBuilder $b, $token)
    {
        return $b->where('invitation_token', $token);
    }
}
