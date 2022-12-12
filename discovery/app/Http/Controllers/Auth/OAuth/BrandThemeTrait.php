<?php

namespace App\Http\Controllers\Auth\OAuth;

use App\Models\Company;

/**
 * Trait ThemeColorTrait
 */

trait BrandThemeTrait
{
    /**
     * @param $brand
     * @return array
     */
    function getBrandColors($brand)
    {
        if ($brand == 'landspot') {
            $color = '#3D40C6';
            $logo  = '/images/LC_Logo_Landspot_Lockup-White.svg';
        } elseif ($brand == 'sitings') {
            $color = '#2B8CFF';
            $logo  = '/images/sitings-logo.png';
        } else {
            $company = Company
                ::where(function ($b) use ($brand) {
                    $b->byBuilderId($brand);
                })
                ->orWhere(function ($b) use ($brand) {
                    $b->byDomainLike($brand);
                })
                ->limit(1)
                ->first();

            if ($company) {
                $color = $company->companyThemeColor;
                $logo  = $company->small_logo_path ? $company->company_expanded_logo : false;
            } else {
                $color = '#2B8CFF';
                $logo  = '/images/sitings-logo.png';
            }
        }
        return compact('color', 'logo');
    }

    /**
     * @param $brand
     * @return string
     */
    function getBrandBasePath($brand)
    {
        switch ($brand) {
            case 'landspot';
                return config('app.url');
            case 'sitings';
                return str_replace('sso.', '', config('app.OAUTH_PROVIDER_URL'));
            default:
                if ($company = Company::byDomainLike($brand)->limit(1)->first()) {
                    return $company->domain;
                } else {
                    return str_replace('sso.', '', config('app.OAUTH_PROVIDER_URL'));
                }
        }
    }
}
