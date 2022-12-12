<?php

namespace App\Models;
/**
 * Trait BuilderCompaniesTrait (for Land Developer and Estate manager)
 */

trait EstatePremiumFeaturesTrait
{
    /**
     * @param string $feature
     * @return bool
     */
    function hasEstatesWithFeature($feature)
    {
        return $this->estate->reduce(function ($acc, $estate) use ($feature) {
            /** @var Estate $estate */
            if ($estate->checkPremiumFeature($feature)) {
                $acc = $acc->push($estate);
            }

            return $acc;
        }, collect([]))->isNotEmpty();
    }
}
