<?php

namespace App\Models;

use App\Facades\EstateRepository;
use App\Notifications\CustomInvitedUserResetEmail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use \Illuminate\Database\Query\{Builder as QueryBuilder};
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use App\Models\Sitings\Siting;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\{Crypt, Mail};

/**
 * Class InvitedUser
 * @property int active
 * @property int chas_discovery
 * @property int company_id
 * @property int enabled
 * @property int id
 * @property int is_global_estate_manager
 * @property int is_user_manager
 * @property int is_discovery_manager
 * @property int is_grant_support_access
 * @property int last_activation_request
 * @property int last_sign_in_stamp
 * @property int lost_password_request
 * @property int has_portal_access
 * @property int billing_access_level
 * @property int primary_group_id
 * @property int parent_id
 * @property int sign_up_stamp
 * @property int state_id
 * @property int verified
 * @property int disabled_estates_access
 * @property string activation_token
 * @property string access_token
 * @property string verify_token
 * @property string display_name
 * @property string first_name
 * @property string last_name
 * @property string email
 * @property string name
 * @property string password
 * @property string type
 * @property string phone
 * @property string title
 * @property string user_name
 * @property string user_unique_id
 * @property string twofa_secret
 * @property string device_fp
 * @property string invitation_token
 * @property bool isBuilderUser
 * @property bool isBriefUser (accessor)
 * @property int accepted_tos
 * @property int notify
 *
 * @property string authGuard
 *
 * @property Company $company
 * @property UserGroup group
 * @property UserRole role
 * @property User landSpotUser
 * @property Siting builderSiting
 * @property UserInvitedUsers userInvitations
 * @property EstateShortList estateShortLists
 * @property ShortList shortLists
 * @property UnsubscribeUser unsubscribed
 * @property Estate developerEstates
 * @property User[] closedSupportSessions
 * @property User[] supportRequests
 * @property UserNotification userNotification
 * @property FloorplanShortList floorplanShortLists
 * @property UserDisabledEmailNotification disabledEmailNotification
 * @property InvitedUser smsVerification
 * @property Estate $estate
 * @property ChatChannel $chatChannel
 * @property int user_id
 * @method static User firstOrCreate(...$args)
 * @method static User firstOrFail(...$args)
 * @method static User find(...$args)
 * @method static byCompany(...$args)
 * @method static byEmail(...$args)
 * @method static byToken(...$args)
 * @method static byPhone(...$args)
 * @method static byId($id)
 * @method static developerAdmin(...$args)
 * @method static builderAdmin(...$args)
 * @method static globalEstateManager(...$args)
 * @method static hasEnabledEmailNotifications()
 * @method static withAndWhereHas(string $string, \Closure $param)
 * @method static updateOrCreate(...$args)
 * @method static where(...$args)
 */
class InvitedUser extends Authenticatable
{
    use Notifiable, CanResetPassword, CanResetPassword, WithAndWhereHasTrait, HasTwoFactorAuthorizationTrait, HasBrowserNotificationsTrait;

    protected $fillable = [
        'email', 'password', 'last_sign_in_stamp', 'phone', 'accepted_tos', 'first_name', 'last_name', 'type', 'notify'
    ];

    protected $hidden = [
        'last_sign_in_stamp', 'accepted_tos', 'type'
    ];

    protected $table = 'invited_users';
    protected $guarded = ['accepted_tos'];

    protected $appends = ['isBriefUser'];

    protected $attributes = [
        'last_sign_in_stamp' => 0,
        'password' => ''
    ];

    public $timestamps = false;

    protected static function boot()
    {
        parent::boot();

        //        static::saved(function (User $user) {
        //            $phone = $user->getOriginal('phone');
        //            if ($phone && $phone !== $user->getAttributeFromArray('phone')) {
        //                event(new PhoneChanged($user));
        //            }
        //        });
        static::deleted(function (InvitedUser $user) {
            if ($user->unsubscribed) {
                $user->unsubscribed()->delete();
            }
        });
    }

    //Accessors

    /**
     * Overrides the method to ignore the remember token.
     */
    function setAttribute($key, $value)
    {
        $isRememberTokenAttribute = $key == $this->getRememberTokenName();
        if (!$isRememberTokenAttribute) {
            parent::setAttribute($key, $value);
        }
    }

    /**
     * @param $landSpotUserId
     * @return string
     */
    function getInvitationMailToken($landSpotUserId)
    {
        $invitationToken = $this->landSpotUser()
            ->wherePivot('user_id', $landSpotUserId)
            ->first(['invitation_token'])
            ->invitation_token;

        return $this->getHashedToken($invitationToken);
    }

    /**
     * @param $token string
     * @return string
     */
    public function getHashedToken($token)
    {
        $appKey = config('app.key');
        $time = time() + 30 * 86400;
        return $token .
            '-' . $time .
            '-' . substr(md5($token . ':' . $time . ':' . $appKey), 16);
    }

    /**
     * @return string
     */
    function getDisplayNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    /**
     * @return bool|string
     */
    function getNonceAttribute()
    {
        return \UrlHelper::getLogoutNonce();
    }

    /**
     * @return bool
     */
    function getIsBuilderUserAttribute()
    {
        return $this->type == 'builder';
    }

    /**
     * @param string $value
     * @return $this
     */
    function setPhoneAttribute($value)
    {
        $value = self::filterPhoneNumber($value);
        $this->attributes['phone'] = $value;

        return $this;
    }

    //Relations

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphOne
     */
    function unsubscribed()
    {
        return $this->morphOne(UnsubscribeUser::class, 'user');
    }

    /**
     * @return HasMany
     */
    function userInvitations()
    {
        return $this->hasMany(UserInvitedUsers::class, 'invited_user_id');
    }

    /**
     * @return HasMany
     */
    public function userInvitationsBrief()
    {
        return $this->userInvitations()->where('status', UserInvitedUsers::STATUS_BRIEF);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    function company()
    {
        return $this->belongsToMany(Company::class, 'user_invited_users', 'invited_user_id', 'company_id')
            ->using(UserInvitedUsers::class)
            ->withPivot([
                'company_id', 'invitation_token', 'status'
            ]);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    function landSpotUser()
    {
        return $this->belongsToMany(User::class, 'user_invited_users', 'invited_user_id', 'user_id')
            ->using(UserInvitedUsers::class)
            ->withPivot([
                'company_id', 'invitation_token', 'status'
            ]);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    function builderSiting()
    {
        return $this->belongsToMany(Siting::class, 'siting_invited_users', 'invited_user_id', 'siting_id')
            ->using(SitingInvitedUsers::class)
            ->withPivot([
                'company_id'
            ]);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    function developerEstates()
    {
        return $this->belongsToMany(Estate::class, 'estate_short_lists', 'invited_user_id', 'estate_id')
            ->whereHas('premiumFeatures', function (EloquentBuilder $b) {
                $b->byType(EstatePremiumFeatures::FEATURE_LOTMIX);
            });
    }

    /**
     * @return HasMany
     */
    function estateShortLists()
    {
        return $this->hasMany(EstateShortList::class);
    }

    /**
     * @return HasManyThrough
     */
    function shortLists()
    {
        return $this->hasManyThrough(ShortList::class, EstateShortList::class);
    }

    /**
     * @return HasMany
     */
    function lotmixNotification()
    {
        return $this->hasMany(InvitedUserNotification::class);
    }

    /**
     * @return HasMany
     */
    function floorplanShortLists()
    {
        return $this->hasMany(FloorplanShortList::class);
    }

    /**
     * @return HasMany
     */
    function documents()
    {
        return $this->hasMany(InvitedUserDocument::class);
    }

    /**
     * @return HasMany
     */
    public function userSession()
    {
        return $this->hasMany(Session::class, 'user_id');
    }

    /**
     * @return HasMany
     */
    function emailNotifications()
    {
        return $this->hasMany(EmailNotification::class, 'notification_user_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    function disabledEmailNotification()
    {
        return $this->hasOne(UserDisabledEmailNotification::class, 'notification_user_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    function smsVerification()
    {
        return $this->hasOne(SMSVerification::class, 'invited_user_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function brief()
    {
        return $this->hasOne(Brief::class);
    }

    /**
     * @return HasMany
     */
    function unreadDocuments()
    {
        return $this->hasMany(UnreadedDocument::class);
    }

    //Scopes

    /**
     * @param EloquentBuilder $b
     * @param string $email
     * @return EloquentBuilder
     */
    function scopeByEmail(EloquentBuilder $b, $email)
    {
        return $b->where('email', $email);
    }

    function scopeById(EloquentBuilder $b, $id)
    {
        return $b->where($b->qualifyColumn('id'), $id);
    }

    //    function scopeHasEnabledEmailNotifications(EloquentBuilder $b)
    //    {
    //        return $b->doesntHave('disabledEmailNotification');
    //    }

    /**
     * @return string
     */
    function getBaseRoute()
    {
        return route('my-lotmix', [], false);
    }

    /**
     * @param $email
     * @return $this
     */
    static function findByEmail($email)
    {
        return self::where('email', '=', $email)->firstOrFail();
    }

    //TODO: deprecated
    /**
    /**
     * @return \Illuminate\Support\Collection
     * @throws \Exception
     */
    function getDistinctLotAttributes()
    {
        $qb = $this->availableEstates(Lot::getDistinctAttributesQB());
        if ($this->isBuilderUser) {
            $this->applyUserFiltersForLotsCount($qb, 'e');
        }

        return $qb->get();
    }

    /**
     * @param $companyIds
     * @return mixed
     */
    function getBuilderCompaniesByIds($companyIds)
    {
        return Company::byIds($companyIds)
            ->hasDiscovery()
            ->hasEstatesAccess()
            ->orderBy(\DB::raw('RAND()'));
    }

    /**
     * @return array Company Ids
     */
    function getBuilderCompanies()
    {
        $builderCompanies = [];

        $companyIds = $this->getBuilderCompaniesIds();

        if ($companyIds->isNotEmpty()) {
            $query = $this->getBuilderCompaniesByIds($companyIds);
            if ($this->isBriefUser) {
                $query->whereHas('user', function ($q) {
                    $q->where('is_brief_admin', true);
                });
            }
            $items = $query->get(['id', 'name', 'logo_path', 'type', 'description', 'phone', 'email', 'website'])
                ->unique();
            $builderCompanies = $items->keyBy('id')->toArray();
        }

        return $builderCompanies;
    }

    function getBuilderCompaniesIds()
    {
        if ($this->isBriefUser) {
            return $this->brief ? $this->brief->companies->pluck('id') : collect([]);
        }
        $statesList = $this->getStatesList();
        return $this->isBuilderUser
            ? $this->userInvitations()
                ->byStatus(UserInvitedUsers::STATUS_CLAIMED)
                ->orderBy('order')
                ->get(['company_id'])->pluck('company_id')
            : Company::builderCompaniesInState($statesList)->get(['id'])->pluck('id');
    }

    /**
     * @return \Illuminate\Support\Collection|array
     */
    function getStatesList()
    {
        return $this->landSpotUser()
                ->wherePivot('status', UserInvitedUsers::STATUS_CLAIMED)
                ->orWherePivot('status', UserInvitedUsers::STATUS_BRIEF)
                ->get(['state_id'])->pluck('state_id')->unique() ?? [];
    }

    /**
     * @param integer $id
     * @return \Illuminate\Database\Eloquent\Collection|\Illuminate\Support\Collection
     */
    function builderSitingByCompanyId($id)
    {
        return $this->builderSiting()->where('company_id', $id)->get();
    }

    /**
     * @return Company
     */
    function builderCompany()
    {
        return Company::whereIn('id', array_keys($this->getBuilderCompanies()));
    }

    /**
     * @return mixed
     */
    function getFirstClaimedInvitation()
    {
        return $this->userInvitations()
            ->byStatus(UserInvitedUsers::STATUS_CLAIMED)
            ->orderBy('order')
            ->first();
    }

    /**
     * @param integer $estate_id
     * @return Model|HasMany|object
     */
    function getEstateShortListByEstateId($estate_id)
    {
        return $this->estateShortLists()
            ->where('estate_id', $estate_id)
            ->get();
    }

    //TODO: deprecated
    /**
     * @param integer $estate_id
     * @return Model|HasMany|object
     */
    function getShortListsByEstateId($estate_id)
    {
        return $this->shortLists()
            ->where('estate_id', $estate_id)
            ->get();
    }

    /**
     * @param integer $lot_id
     * @return null|ShortList
     */
    function getShortListByLotId($lot_id)
    {
        return $this->shortLists()
            ->where('lot_id', $lot_id)
            ->first();
    }

    /**
     * @param integer $estate_id
     * @return Model|HasMany|object
     */
    function documentsByEstateId($estate_id)
    {
        return $this->documents()
            ->where('estate_id', $estate_id)
            ->get();
    }

    //TODO: deprecated
    /**
     * @param $filters
     * @return \Illuminate\Support\Collection
     * @throws \Exception
     */
    function getEstatesLotCount($filters): \Illuminate\Support\Collection
    {
        $estatesQB = EstateRepository::createEstatesLotsCountQB($filters);
        $lotsQB = EstateRepository::createFilteredLotsCountQB($filters);

        if (!$this->isBriefUser) {
            $this->applyUserFiltersForLotsCount($lotsQB);
            $this->availableEstates($estatesQB);
        }

        $orderBy = $this->isBuilderUser
            ? DB::raw('RAND()')
            : 'e.name';

        $estatesQB->leftJoin('estate_premium_features as epf', 'epf.estate_id', '=', 'e.id')
            ->where('epf.type', EstatePremiumFeatures::FEATURE_LOTMIX);

        $estatesQB
            ->leftJoin(DB::raw('(' . $lotsQB->toSql() . ') as lc'), 'e.id', '=', 'lc.id')
            ->addSelect(
                DB::raw('ifnull(lc.lots_count, 0 ) as lots_count')
            )
            ->orderBy($orderBy);

        return $estatesQB->get();
    }

    /**
     * @param QueryBuilder $qb
     * @param string $tableAlias
     * @return QueryBuilder
     */
    protected function availableEstates(QueryBuilder $qb, $tableAlias = 'e')
    {
        $stateIds = $this->getStatesList();
        return $this->isBuilderUser
            ? $qb
                ->where([
                    $tableAlias . '.published' => \DB::raw(1),
                    $tableAlias . '.approved' => \DB::raw(1),
                ])
                ->whereIntegerInRaw($tableAlias . '.state_id', $stateIds)
            : $qb
                ->join('estate_short_lists as em', 'em.estate_id', '=', $tableAlias . '.id')
                ->where('em.invited_user_id', \DB::raw($this->id));
    }

    /**
     * @param QueryBuilder $lotsQB
     * @param string $tableAlias
     */
    protected function applyUserFiltersForLotsCount(QueryBuilder $lotsQB, $tableAlias = 'estate_lots')
    {
        $this->availableEstates($lotsQB, $tableAlias);
    }

    function getShorList()
    {
        $user = $this;

        $companies = [];
        $companyIds = $this->getBuilderCompaniesIds();
        if ($companyIds->isNotEmpty()) {
            $companies = $this->getBuilderCompaniesByIds($companyIds)
                ->with([
                    'house' => function ($b) use ($user) {
                        $b->with(['attributes', 'floorplanShortLists' => function ($b) use ($user) {
                            $b->byInvitedUser($user->id);
                        }])
                            ->whereHas('floorplanShortLists', function (EloquentBuilder $b) use ($user) {
                                $b->byInvitedUser($user->id);
                            });
                    }
                ])
                ->whereHas('house.floorplanShortLists', function (EloquentBuilder $b) use ($user) {
                    $b->byInvitedUser($user->id);
                })->get()->unique();
        }

        $estates = $this->estateShortLists()
            ->with('estate')
            ->whereHas('estate', function ($b) {
                $b->whereHas('premiumFeatures', function (EloquentBuilder $b) {
                    $b->byType(EstatePremiumFeatures::FEATURE_LOTMIX);
                });
            })
            ->with(['shortList' => function ($b) {
                $b->with('stage.drawerTheme');
                $b->withAndWhereHas('lot', function ($b) {
                    $b->where('lotmix_visibility', Lot::lotmixVisibility['visible']);
                    $b->with('drawerData');
                });
            }])
            ->get()
            ->values();


        $estates = $estates->filter(function ($estate) {
            return count($estate->shortList);
        })->each(function ($estate) {
            $estate->shortList->each(function ($shortListItem) {
                $shortListItem->lot->drawerData->append('lotImage');
                $shortListItem->stage->drawerTheme->append('backgroundImage');
            });
        })->values();

        return compact('companies', 'estates');
    }

    /**
     * @return boolean
     */
    function isGlobalAdmin()
    {
        return false;
    }

    /**
     * @return boolean
     */
    public function getIsBriefUserAttribute()
    {
        $userInvitationsBrief = $this->userInvitationsBrief;
        return $userInvitationsBrief->isNotEmpty()
            ? $userInvitationsBrief->first()->status === UserInvitedUsers::STATUS_BRIEF
            : false;
    }

    /**
     * @param $value
     * @return null|string|string[]
     */
    static function filterPhoneNumber($value)
    {
        return preg_replace('/[^+0-9]+/', '', $value);
    }

    static function allBriefAdmins()
    {
        return static::withAndWhereHas('landSpotUser', function ($b) {
            $b->where('is_brief_admin', true);
        })->get();
    }

    /**
     *
     */
    function logoutFromFootprints()
    {
    }

    /**
     * @param $landSpotUserId
     * @return bool
     */
    function restoreInvitation($landSpotUserId)
    {
        $userInvitation = $this->userInvitations()->withTrashed()->byLandSpotUser($landSpotUserId)->first();
        if ($userInvitation->trashed()) {
            return $userInvitation->restore();
        }
        return false;
    }

    /**
     * @param Siting $siting
     * @return void|array
     * @throws \Throwable
     */
    function processInvitation(Siting $siting)
    {
        /** @var User $landSpotUser */
        $landSpotUser = request()->user();
        $company = $landSpotUser->company;
        $user = $this;

        if ($landSpotUser->invitedUser->contains($user) && $user->builderSiting->contains($siting)) {
            return abort(409, 'User already invited to this siting');
        }

        if ($siting->hasBuyer) {
            return abort(409, 'This siting is already owned by another buyer.');
        }

        $ajax_success = \DB::transaction(function () use (
            $landSpotUser, $company, $user, $siting
        ) {

            if (!$landSpotUser->invitedUser->contains($user)) {
                $landSpotUser->invitedUser()->attach($user);
            }

            if (!$user->builderSiting->contains($siting)) {
                $user->builderSiting()->attach(
                    $siting,
                    ['company_id' => $landSpotUser->company_id]
                );
            }
            if ($user->unsubscribed()->doesntExist()
                && filter_var($user->email, FILTER_VALIDATE_EMAIL)
                && \EmailDisabledCheckHelper::checkEmail($user->email)) {
                $hash = Crypt::encrypt([
                    'type' => UnsubscribeUser::USER_TYPE['client'],
                    'email' => $user->email
                ]);
                $data = [
                    'user' => $user,
                    'authUser' => $landSpotUser,
                    'hash' => $hash
                ];
                $companyName = ucwords($company->name);

                $userInvitations = $user->userInvitations()
                    ->withTrashed()
                    ->byStatus(UserInvitedUsers::STATUS_CLAIMED)
                    ->count();

                if ($user->wasRecentlyCreated || $userInvitations <= 0) {
                    $data['invitationToken'] = $user->getInvitationMailToken($landSpotUser->id);
                    $subject = "Activate your " . config('app.LOTMIX_URL') . " account";
                    $user->sendInvitationEmail('emails.lotmix-invitation', $data, $subject);
                } else {
                    $subject = "You have a new siting shared with you by $companyName";
                    $user->sendInvitationEmail('emails.lotmix-siting-assign', $data, $subject);
                }
            }
            return 'Siting sent to client and notified by email.';

        });

        return compact('ajax_success');
    }

    public function sendInvitationEmail($view, $data, $subject = 'Invitation to Lotmix')
    {
        $user = $this;
        Mail::send($view, $data, function (Message $msg) use ($user, $subject) {
            $msg->from(config('mail.support.lotmix'), config('app.LOTMIX_URL'))
                ->to($user->email, $user->display_name)
                ->subject($subject);
        });
    }

    public function getMyLotmixCompanies()
    {
        $companies = collect([]);
        $companyIds = $this->getBuilderCompaniesIds();
        if ($companyIds->isNotEmpty()) {
            $companies = $this->getBuilderCompaniesByIds($companyIds)
                ->get(['id', 'name', 'logo_path', 'type'])->unique();
        }

        return $companies;
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomInvitedUserResetEmail($token));
    }
}
