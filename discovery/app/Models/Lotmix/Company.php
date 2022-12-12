<?php

namespace App\Models\Lotmix;

use App\Models\Company as LandspotCompany;
/**
 * Class Company
 */
class Company extends LandspotCompany
{
    /**
     * Get the route key for the model.
     *
     * @return string
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
