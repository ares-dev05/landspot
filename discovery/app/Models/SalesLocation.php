<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{
    Model, Builder as EloquentBuilder
};

/**
 * Class SalesLocation
 * @property int company_id
 * @property string name
 * @method SalesLocation byCompany(...$args)
 * @method SalesLocation find(...$args)
 */
class SalesLocation extends Model
{
    protected $table = 'sales_locations';

    protected $fillable = [
        'company_id', 'name'
    ];

    public $timestamps = false;

    function builders()
    {
        return $this->belongsToMany(Builder::class, 'builder_sales_location', 'location_id', 'user_id');
    }

    /**
     * @param EloquentBuilder $b
     * @param $companyId
     * @return Range
     */
    function scopeByCompany(EloquentBuilder $b, $companyId)
    {
        return $b->where(['company_id' => $companyId]);
    }
}
