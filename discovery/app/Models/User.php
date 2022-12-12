<?php

namespace App\Models;

use App\Facades\EstateRepository;
use App\Models\Sitings\HasSitingTrait;
use App\Models\Sitings\SharedSiting;
use App\Models\Sitings\Siting;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use App\Events\{PhoneChanged, TwoFAStateChanged};
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use Illuminate\Support\Facades\DB;

/**
 * Class User
 * @property int active
 * @property int chas_discovery
 * @property int company_id
 * @property int enabled
 * @property bool inactive
 * @property int hidden
 * @property int id
 * @property int is_global_estate_manager
 * @property int is_user_manager
 * @property int is_discovery_manager
 * @property int is_grant_support_access
 * @property int last_activation_request
 * @property int last_sign_in_stamp
 * @property int lost_password_request
 * @property int has_portal_access
 * @property int has_lotmix_access
 * @property int billing_access_level
 * @property int primary_group_id
 * @property int sign_up_stamp
 * @property int state_id
 * @property int verified
 * @property int disabled_estates_access
 * @property int draft_feature
 * @property int is_brief_admin
 * @property int is_nearmap_admin
 * @property int has_all_sitings
 * @property string activation_token
 * @property string access_token
 * @property string verify_token
 * @property string display_name
 * @property string email
 * @property string name
 * @property string password
 * @property string phone
 * @property string title
 * @property string user_name
 * @property string user_unique_id
 * @property string twofa_secret
 * @property string device_fp
 * @property int accepted_tos
 *
 * @property string authGuard
 *
 * @property Company $company
 * @property State state
 * @property UserGroup group
 * @property InvitedUser invitedUser
 * @property UserRole role
 * @property Siting getSharedSiting
 * @property SharedSiting sharedSiting
 * @property User[] closedSupportSessions
 * @property User[] supportRequests
 * @property UserNotification userNotification
 * @property UserDisabledEmailNotification disabledEmailNotification
 * @property Estate $estate
 * @property UnsubscribeUser $unsubscribed
 * @property ChatChannel $chatChannel
 * @property Collection availableInvitedUsers
 * @method static User firstOrCreate(...$args)
 * @method static User firstOrFail(...$args)
 * @method static User find(...$args)
 * @method static byCompany(...$args)
 * @method static byEmail(...$args)
 * @method static byPhone(...$args)
 * @method static byId($id)
 * @method static developerAdmin(...$args)
 * @method static builderAdmin(...$args)
 * @method static globalEstateManager(...$args)
 * @method static hasEnabledEmailNotifications()
 * @method static notHiddenById($id)
 * @method static where(...$args)
 * @method static whereIn(...$args)
 */
class User extends Authenticatable
{
    use HasApiTokens, Notifiable, CanResetPassword, HasTwoFactorAuthorizationTrait, HasBrowserNotificationsTrait, HasSitingTrait;

    const USER_DISCOVERY_LEVELS = [
        'Inherit from company' => 0,
        'Permanent access' => 1,
        'Access disabled' => 2
    ];

    const PORTAL_ACCESS_SITINGS = 0;
    const PORTAL_ACCESS_BUILDER = 1;
    const PORTAL_ACCESS_CONTRACTOR = 2;
    const PORTAL_ACCESS_ADMIN = 3;

    const MAX_INACTIVE_DAYS = 45;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_name', 'email', 'company_id', 'state_id', 'display_name',
        'password', 'activation_token', 'last_activation_request', 'lost_password_request',
        'active', 'title', 'sign_up_stamp', 'last_sign_in_stamp', 'enabled', 'hidden', 'primary_group_id',
        'phone', 'is_global_estate_manager', 'is_user_manager', 'is_discovery_manager', 'verify_token', 'verified',
        'is_grant_support_access', 'access_token', 'refresh_token', 'has_portal_access', 'has_lotmix_access', 'billing_access_level',
        'chas_discovery', 'twofa_secret', 'device_fp', 'accepted_tos', 'disabled_estates_access', 'draft_feature',
        'is_brief_admin', 'is_nearmap_admin'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'access_token', 'activation_token', 'has_exclusive', 'has_master_access',
        'has_multihouse', 'has_nearmap', 'is_envelope_admin', 'last_activation_request',
        'last_sign_in_stamp', 'lost_password_request', 'lost_password_timestamp', 'refresh_token', 'sign_up_stamp',
        'verify_token', 'primary_group_id', 'group', 'twofa_secret', 'device_fp', 'billing_access_level', 'enabled', 'accepted_tos'
    ];


    protected $table = 'uf_users';
    protected $guarded = ['chas_discovery', 'twofa_secret', 'device_fp', 'accepted_tos', 'has_portal_access'];

    protected $attributes = ['verified' => 0];

    public $timestamps = false;

    protected $_otpLib;

    public function __construct(array $attributes = [])
    {
        $this->connection = config('database.default');

        return parent::__construct(...func_get_args());
    }

    protected static function boot()
    {
        parent::boot(); // TODO: Change the autogenerated stub

        static::saved(function (User $user) {
            $phone = $user->getOriginal('phone');
            if ($phone && $phone !== $user->getAttributeFromArray('phone')) {
                event(new PhoneChanged($user));
            }
            if ($user->getOriginal('twofa_secret') !== $user->getAttributeFromArray('twofa_secret')) {
                event(new TwoFAStateChanged($user));
            }
        });

        static::deleted(function (User $user) {
            if ($user->unsubscribed) {
                $user->unsubscribed()->delete();
            }
        });

        static::addGlobalScope('activeUsers', function (EloquentBuilder $b) {
            $b->activeAccount();
        });
    }

    //Accessors

    /**
     * Overrides the method to ignore the remember token.
     */
    public function setAttribute($key, $value)
    {
        $isRememberTokenAttribute = $key == $this->getRememberTokenName();
        if (!$isRememberTokenAttribute) {
            parent::setAttribute($key, $value);
        }
    }

    function getUserUniqueIDAttribute()
    {
        $appKey = config('app.key');

        return md5($this->id . ':' . $appKey);
    }

    function getAvatarAttribute()
    {
        return $this->company->company_small_logo;
    }

    /**
     * @return bool
     * @throws \Exception
     */
    function getCanChangePhoneAttribute()
    {
        $id = $this->id;
        $v = cache('user:' . $id . ':last_phone_reset_ts');

        return $this->phone == '' || !$v || time() - $v > 86400;
    }

    /**
     * @return int
     * @throws \Exception
     */
    function getPhoneAuthorizationStepAttribute()
    {
        $id = $this->id;
        $v = cache('user:' . $id . ':new_phone_request_ts');
        return (int)$v;
    }

    /**
     * @return string
     * @throws \Exception
     */
    function getNewPhoneNumberAttribute()
    {
        $id = $this->id;
        return cache('user:' . $id . ':new_phone');
    }

    function getHasPortalAccessAttribute()
    {
        $level = $this->getAttributeFromArray('has_portal_access');
        if (!$level && $this->hasGroup(UserGroup::GroupGlobalAdmins)) {
            $level = self::PORTAL_ACCESS_ADMIN;
        }

        return $level;
    }

    function setPhoneAttribute($value)
    {
        $value = self::filterPhoneNumber($value);
        $this->attributes['phone'] = $value;

        return $this;
    }

    function getInactiveAttribute()
    {
        return $this->verified
            ? $this->last_sign_in_stamp < Carbon::now()->subDays(self::MAX_INACTIVE_DAYS)->timestamp
            : false;
    }

    //Relations
    function company()
    {
        return $this->belongsTo(Company::class);
    }

    function group()
    {
        return $this->belongsToMany(UserGroup::class, 'uf_user_group_matches', 'user_id', 'group_id');
    }

    function userChat()
    {
        return $this->hasMany(UserChat::class, 'user_id');
    }

    function unsubscribed()
    {
        return $this->morphOne(UnsubscribeUser::class, 'user');
    }

    function chatChannel()
    {
        return $this->hasManyThrough(ChatChannel::class, UserChat::class, 'user_id', 'id', 'id', 'channel_id');
    }

    function state()
    {
        return $this->hasOne(State::class, 'id', 'state_id');
    }

    function supportRequests()
    {
        return $this->belongsToMany(User::class, 'support_requests');
    }

    function closedSupportSessions()
    {
        return $this->belongsToMany(User::class, 'closed_support_sessions');
    }

    public function oauthAcessToken()
    {
        return $this->hasMany(OauthAccessToken::class, 'user_id');
    }

    public function userSession()
    {
        return $this->hasMany(Session::class, 'user_id');
    }

    public function userNotification()
    {
        return $this->hasMany(UserNotification::class);
    }

    function emailNotifications()
    {
        return $this->hasMany(EmailNotification::class, 'notification_user_id');
    }

    function sharedSiting()
    {
        return $this->hasMany(SharedSiting::class, 'user_id');
    }

    function getSharedSiting()
    {
        return $this->hasManyThrough(
            Siting::class,
            SharedSiting::class,
            'shared_sitings.user_id',
            'sitings.id',
            'uf_users.id',
            'shared_sitings.siting_id');
    }

    function disabledEmailNotification()
    {
        return $this->hasOne(UserDisabledEmailNotification::class, 'notification_user_id');
    }

    public function role()
    {
        return $this->hasOne(UserRole::class, 'user_id', 'id');
    }

    function invitedUser()
    {
        return $this->belongsToMany(InvitedUser::class, 'user_invited_users', 'user_id', 'invited_user_id')
            ->using(UserInvitedUsers::class)
            ->withPivot([
                'company_id', 'invitation_token', 'status', 'deleted_at'
            ])->withTimestamps();
    }

    function availableInvitedUsers()
    {
        return $this->invitedUser()->wherePivot('deleted_at', null);
    }

    /**
     *
     * @param int $id
     * @return InvitedUser|null
     */
    function findInvitedUserById($id)
    {
        return $this->invitedUser()->where('invited_users.id', $id)->first();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param InvitedUser $client
     * @return int
     */
    function deleteInvitedUser(InvitedUser $client)
    {
        return $this->invitedUser()->detach($client);
    }

    function invitedUserDocuments()
    {
        return $this->hasMany(InvitedUserDocument::class, 'document_owner_id', 'id');
    }

    //Scopes
    function scopeActiveAccount(EloquentBuilder $b)
    {
        return $b->where([
            $b->qualifyColumn('active') => 1,
            $b->qualifyColumn('enabled') => 1
        ]);
    }

    function scopeByCompany(EloquentBuilder $b, $companyId)
    {
        return $b->where($b->qualifyColumn('company_id'), $companyId);
    }

    function scopeById(EloquentBuilder $b, $id)
    {
        return $b->where($b->qualifyColumn('id'), $id);
    }

    function scopeByNameLike(EloquentBuilder $b, $name, $operator = 'and')
    {
        return $name == ''
            ? $b
            : $b->where('display_name', 'like', '%' . $name . '%', $operator);
    }

    function scopeGlobalEstateManager(EloquentBuilder $b, $operator = 'and')
    {
        return $b->where('is_global_estate_manager', '=', 1, $operator);
    }

    function scopeBuilderAdmin(EloquentBuilder $b, $operator = 'and')
    {
        return $b->has('group', '>=', 1, $operator, function ($b) {
            $b->builderAdmins();
        });
    }

    function scopeNotBuilderAdmin(EloquentBuilder $b, $operator = 'and')
    {
        return $b->has('group', '<=', 0, $operator, function ($b) {
            $b->builderAdmins();
        });
    }

    function scopeDeveloperAdmin(EloquentBuilder $b, $operator = 'and')
    {
        return $b->has('group', '>=', 1, $operator, function ($b) {
            $b->developerAdmins();
        });
    }

    function scopeHasEnabledEmailNotifications(EloquentBuilder $b)
    {
        return $b->doesntHave('disabledEmailNotification');
    }

    function scopeNotHiddenById(EloquentBuilder $b, $id)
    {
        return $b->withoutGlobalScopes()->where([['id', '=', $id], ['hidden', '=', false]]);
    }

    //User functions

    /**
     * @param $email
     * @return $this
     */
    static function findByEmail($email)
    {
        return self::where('email', '=', $email)->firstOrFail();
    }

    function scopeByEmail(EloquentBuilder $b, $email)
    {
        return $b->where('email', $email);
    }

    function scopeByPhone(EloquentBuilder $b, $v)
    {
        $value = str_replace([' ', '(', ')', '-'], '', $v);

        return $b->where(function (EloquentBuilder $qb) use ($value) {
            $qb->where('phone', $value);
            if (strpos($value, '+61') !== 0 && strpos($value, '0') === 0) {
                $value = substr($value, 1);
                $qb->orWhere('phone', '+61' . $value);
            }
        });
    }


    function isLandDeveloper()
    {
        return $this->hasGroup(UserGroup::GroupDeveloperAdmins);
    }

    function isEstateManager()
    {
        return $this instanceof EstateManager;
    }

    /**
     * @return boolean
     */
    function isGlobalAdmin()
    {
        return $this->hasGroup(UserGroup::GroupGlobalAdmins);
    }

    /**
     * @return boolean
     */
    function isBuilderAdmin()
    {
        return $this->hasGroup(UserGroup::GroupBuilderAdmins);
    }

    /**
     * @return boolean
     */
    function isUserManager()
    {
        return !!$this->is_user_manager;
    }

    /**
     * @return boolean
     */
    function isGlobalEstateManager()
    {
        return !!$this->is_global_estate_manager;
    }

    /**
     * @return boolean
     */
    function isDiscoveryManager()
    {
        return !!$this->is_discovery_manager;
    }

    /**
     * @return bool
     */
    function isSalesConsultant()
    {
        return optional($this->role)->role == UserRole::USER_ROLES['Sales Consultant'];
    }


    /**
     * @return boolean
     */
    public function hasGroup($group)
    {
        if (is_string($group)) {
            return $this->group->contains('name', $group);
        }

        return !!$group->intersect($this->group)->isNotEmpty();
    }

    public function assignGroup($group)
    {
        return $this->group()->attach($group);
    }

    public function removeGroup($group)
    {
        return $this->group()->detach($group);
    }

    function getBaseRoute()
    {
        return route('landspot.my-estates', [], false);
    }

    /**
     * @return \Illuminate\Support\Collection
     * @throws \Exception
     */
    function getDistinctLotAttributes()
    {
        $qb = $this->availableEstates(Lot::getDistinctAttributesQB());
        if (!$this->isGlobalAdmin() && $this->company->isBuilder()) {
            $this->applyUserFiltersForLotsCount($qb, 'e');
        }
        return $qb->get();
    }

    /**
     * @param $filters
     * @return \Illuminate\Support\Collection
     * @throws \Exception
     */
    function getEstatesLotCount($filters)
    {
        $estatesQB = EstateRepository::createEstatesLotsCountQB($filters);
        $lotsQB = EstateRepository::createFilteredLotsCountQB($filters);

        $this->availableEstates($estatesQB);
        $this->applyUserFiltersForLotsCount($lotsQB);

        $estatesQB
            ->leftJoin(DB::raw('(' . $lotsQB->toSql() . ') as lc'), 'e.id', '=', 'lc.id')
            ->addSelect(
                DB::raw('ifnull(lc.lots_count, 0 ) as lots_count')
            )
            ->orderBy(
                $this->company->isBuilder()
                    ? DB::raw('RAND()')
                    : 'e.name'
            );

        return $estatesQB->get();
    }

    /**
     * @param QueryBuilder $lotsQB
     * @throws \Exception
     */
    protected function applyUserFiltersForLotsCount(QueryBuilder $lotsQB, $tableAlias = 'estate_lots')
    {
        //Override in child models
        throw new \Exception('This method can be called only in child models');
    }

    protected function availableEstates(QueryBuilder $qb, $tableAlias = 'e')
    {
        //Override in child models
        throw new \Exception('This method can be called only in child models');
    }

    /**
     * @param boolean $builderCompanies
     * @return array Company Ids
     */
    function getUserCompanies($builderCompanies = false)
    {
        return $this
            ->company()
            ->get(['id', 'name', 'logo_path', 'type'])
            ->keyBy('id')
            ->toArray();
    }

    /**
     * @param array $companiesIds
     * @param array $filters
     * @return \Illuminate\Support\Collection
     */
    static function countAvailableUsers(array $companiesIds, array $filters)
    {
        $qb = static::applyUserFilters($companiesIds, $filters)
            ->select('u.company_id', DB::raw('count(*) users_count'))
            ->groupBy('u.company_id');

        return $qb->get();
    }

    /**
     * @param array $companiesIds
     * @param array $filters
     * @param string $sortBy
     * @return \Illuminate\Support\Collection
     */
    static function getFilteredCollection(array $companiesIds, array $filters, $sortBy = null)
    {
        $q = static::applyUserFilters($companiesIds, $filters);
        if ($sortBy) $q->orderBy($sortBy);

        return $q
            ->distinct()
            ->leftJoin(
                "users_disabled_email_notifications as en",
                'en.notification_user_id',
                '=',
                'u.id'
            )
            ->get([
                'u.id',
                'display_name',
                'email',
                'phone',
                'state_id',
                'is_global_estate_manager',
                'is_discovery_manager',
                'is_user_manager',
                'is_grant_support_access',
                'has_portal_access',
                'has_lotmix_access',
                'has_exclusive',
                DB::raw('IFNULL(en.notification_user_id, 0) as disabled_email_notifications'),
            ]);
    }

    /**
     * @param array $companiesIds
     * @param array $filters
     * @return \Illuminate\Database\Query\Builder
     */
    protected static function applyUserFilters(array $companiesIds, array $filters)
    {
        $adminsIds = [];
        $user = \Auth::user();

        $admins = $filters['withoutAdmins'] ?? 0;
        if ($admins) {
            if ($user->company->isDeveloper()) {
                $adminsIds = UserGroup::developerAdmins()->first()->user()->get()->pluck('id');
            } elseif ($user->company->isBuilder()) {
                $adminsIds = UserGroup::builderAdmins()->first()->user()->get()->pluck('id');
            }
        }

        $query = isset($filters['enabled']) ? ['active' => 1, 'enabled' => 1] : [];

        return \DB
            ::table((new self())->getTable() . " as u")
            ->whereIn('u.company_id', $companiesIds)
            ->whereNotIn('u.id', $adminsIds)
            ->where($query)
            ->where(function (QueryBuilder $q) use ($filters) {
                $pdoConn = DB::connection()->getPdo();

                $v = $filters['state_id'] ?? 0;
                if ($v > 0) {
                    $q->where('u.state_id', DB::raw((float)$v));
                }
                //
                //                $v = $filters['email'] ?? '';
                //                if ($v != '') {
                //                    $q->where('u.email', 'like', DB::raw($pdoConn->quote("%{$v}%")));
                //                }

                $v = $filters['name'] ?? '';
                if ($v != '') {
                    $q->where('u.display_name', 'like', DB::raw($pdoConn->quote("%{$v}%")));
                    $q->orWhere('u.email', 'like', DB::raw($pdoConn->quote("%{$v}%")));
                }

                $v = $filters['globalEstateManager'] ?? 0;
                if ($v > 0) {
                    $q->where('u.is_global_estate_manager', DB::raw((float)$v));
                }

                $v = $filters['userManager'] ?? 0;
                if ($v > 0) {
                    $q->where('u.is_user_manager', DB::raw((float)$v));
                }
            });
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    function getUserRanges()
    {
        return Range::byCompanyState($this->state_id, $this->company_id)->get();
    }

    function getAuthGuardAttribute()
    {
        if ($this->hasGroup(UserGroup::GroupGlobalAdmins)) {
            return 'globalAdmin';
        } elseif ($this->hasGroup(UserGroup::GroupBuilderAdmins)) {
            return 'builderAdmin';
        } elseif ($this->company->isBuilder()) {
            return 'builder';
        } elseif ($this->company->isDeveloper()) {
            if ($this->hasGroup(UserGroup::GroupDeveloperAdmins)) {
                return 'landDeveloper';
            } elseif ($this->hasGroup(UserGroup::GroupDefault) && $this->isGlobalEstateManager()) {
                return 'globalEstateManager';
            } elseif ($this->hasGroup(UserGroup::GroupDefault)) {
                return 'estateManager';
            }
        } else {
            return 'web';
        }
    }

    /**
     * @return bool|string
     */
    function getNonceAttribute()
    {
        return \UrlHelper::getLogoutNonce();
    }

    static function getUserByPasswordToken($token)
    {
        $rows = DB::table(config('auth.passwords.users.table'))
            ->select(['email', 'token'])
            ->get();

        foreach ($rows as $row) {
            if (password_verify($token, $row->token)) {
                return User::findByEmail($row->email);
            }
        }
    }

    static function filterPhoneNumber($value)
    {
        return preg_replace('/[^+0-9]+/', '', $value);
    }

    function logoutFromFootprints()
    {
        try {
            DB::table('uf_sessions')
                ->where('sessionData', 'like', '%' . $this->email . '%')
                ->delete();
        } catch (\Exception $e) {
        }
    }

    /**
     * @param array $filters
     * @param string $sort
     * @return Collection
     */
    public function getInvitedUserForMyClientsTable(array $filters, string $sort = 'DESC'): Collection
    {
        $query = $this->availableInvitedUsers()->orderBy('id', "{$sort}");

        $query->whereHas('userInvitations', function ($query) {
            $query->where('status', '!=', UserInvitedUsers::STATUS_BRIEF);
        });
        if (auth()->user()->company->isDeveloper()) {
            $query->with('estateShortLists');
        }

        if ($firstName = trim($filters['firstName'] ?? '')) {
            $query->where('first_name', 'like', "%{$firstName}%");
        }

        if ($lastName = trim($filters['lastName'] ?? '')) {
            $query->where('last_name', 'like', "%{$lastName}%");
        }

        $query->withCount(['userInvitations' => function ($qb) {
            $qb->byStatus(UserInvitedUsers::STATUS_CLAIMED);
        }]);

        return $query->get();
    }
}
