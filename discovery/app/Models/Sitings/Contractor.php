<?php


namespace App\Models\Sitings;


class Contractor extends User
{
    function getBaseRoute()
    {
        return route('floorplans.index', [], false);
    }
}