<?php

namespace Landconnect\Blog\Http\Controllers;

/**
 * Trait ThemeColorTrait
 */

trait BrandThemeTrait
{
    /**
     * @return array
     */
    function getBrandColors()
    {
        $host = $_SERVER['HTTP_X_INSIGHTS_URL'] ?? request()->getHost();

        $brand = 'landspot';
        $color = '#3D40C6';
        $logo = '/images/LC_Logo_Landspot_Lockup-Blue.svg';
        switch ($host) {
            case 'www.landconnect.com.au':
            case 'landconnect.com.au':
                $brand = 'landconnect';
                $color = '#1DE995';
                $logo = '/images/landconnect-logo.png';
                break;
            case 'www.kaspa.io':
            case 'kaspa.io':
                $brand = 'kaspa';
                $color = '#FF5D53';
                $logo = '/images/kaspa-logo.png';
                break;
        }

        return compact('brand', 'color', 'logo');
    }
}
