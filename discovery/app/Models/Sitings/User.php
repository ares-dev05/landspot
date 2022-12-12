<?php

namespace App\Models\Sitings;

use App\Models\User as LandSpotUser;
use Illuminate\Database\Eloquent\{Builder as EloquentBuilder, Collection};
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Class User
 * @property string auth_guard
 * @property string display_name
 * @property string email
 * @property string access_token
 * @property string refresh_token
 * @property int id
 * @property int company_id
 * @property int has_portal_access
 * @property int has_multihouse
 * @property int has_exclusive
 * @property int has_nearmap
 * @property int draft_feature
 *
 * @property Collection $videoTutorials
 * @method static User firstOrCreate(...$args)
 * @method static User firstOrFail(...$args)
 * @method static User find(...$args)
 */
class User extends LandSpotUser
{
    use HasSitingTrait;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'company_id', 'display_name', 'email', 'access_token', 'refresh_token', 'has_portal_access', 'has_multihouse', 'has_exclusive', 'has_nearmap', 'draft_feature'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = ['access_token', 'refresh_token', 'has_portal_access', 'has_multihouse', 'has_exclusive', 'has_nearmap'];

    protected $guarded = ['access_token', 'refresh_token', 'has_portal_access', 'has_multihouse', 'has_exclusive', 'has_nearmap'];

    function getBaseRoute()
    {
        if ($this->can('portal-access')) {
            return route('floorplans.index', [], false);
        }

        return route('reference-plan', [], false);
    }

    function scopeByPortalAccess(EloquentBuilder $b, $type, $operator = 'and')
    {
        return $b->where($b->qualifyColumn('has_portal_access'), '=', $type, $operator);
    }

    static function createOrUpdateFromAPI($accessToken, $refreshToken)
    {
        UserAPI::setAccessToken($accessToken);
        $result = UserAPI::get('user');

        $user = User::byId($result['id'])->first();

        $user->update([
            'access_token'  => $accessToken,
            'refresh_token' => $refreshToken
        ]);

        return $user;
    }

    /**
     * @return integer
     */
    function getSitingsExportPermission()
    {
        $state   = $this->state;
        $company = $this->company;
        return $state->getLotmixSettingsValue($company);
    }

    function getMyClientsUrlAttribute()
    {
        return config('app.url') . route('my-clients.index', [], false);
    }

    /**
     * @return string
     */
    function getAuthGuardAttribute()
    {
        switch ($this->has_portal_access) {
            case self::PORTAL_ACCESS_BUILDER:
                $guard = 'sitingsBuilder';
                break;
            case self::PORTAL_ACCESS_CONTRACTOR:
                $guard = 'contractor';
                break;
            default:
                if ($this->isGlobalAdmin()) {
                    $guard = 'globalAdmin';
                    break;
                } elseif ($this->can('footprints')) {
                    $guard = 'sitingsBuilder';
                    break;
                }
                throw new BadRequestHttpException('Invalid user level');
        }

        return $guard;
    }
}
