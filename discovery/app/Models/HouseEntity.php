<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

abstract class HouseEntity extends Model
{
    public $updateHouseDiscoveryOnDelete = true;
    protected static $storageFolder;

    protected static function boot()
    {
        parent::boot();
        static::deleted(function ($item) {
            if ($item->updateHouseDiscoveryOnDelete) {
                House::onDeleted($item->house_id);
            }
        });
    }
}