<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\Model;

/**
 * Class EstatePremiumFeatures
 * @property int estate_id
 * @property string type
 * @method static byType($type)
 */
class EstatePremiumFeatures extends Model
{
    protected $table = 'estate_premium_features';
    protected $fillable = ['estate_id', 'type'];
    protected $hidden = ['estate_id'];
    public $timestamps = false;

    const FEATURE_LOTMIX = 'lotmix';
    const features = [
        'api-access-to-manage-lot-lists',
        'branded-for-your-company',
        'builder-activity',
        'capture-referrals',
        'changelog',
        'e-mail-information-direct-from-the-application',
        'estate-maps',
        'full-estate-profile',
        'global-notification',
        'lot-drawer',
        'lot-specific-custom-brochure-generation',
        'one-click-hl-package-conversion',
        'push-to-3rd-party-realestate-platforms',
        'user-profiles',
        'weekly-sales-reports',
        EstatePremiumFeatures::FEATURE_LOTMIX,
    ];

    function estate()
    {
        return $this->belongsTo(Estate::class);
    }

    function scopeByType(EloquentBuilder $b, $type)
    {
        return $b->where(compact('type'));
    }
}
