<?php

namespace App\Models\Lotmix;

use App\Models\Estate as LandspotEstate;

/**
 * Class Estate
 */
class Estate extends LandspotEstate
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
