<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;

class EstateManagerPermission extends Model
{
    public $timestamps = false;

    protected $fillable = ['manager_id', 'estate_id', 'permission_id'];

    /**
     * @param EloquentBuilder $b
     * @param array $columns
     * @return EloquentBuilder
     */
    function scopeByColumns(EloquentBuilder $b, $columns)
    {
        return $b->where($columns);
    }

    function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }
}
