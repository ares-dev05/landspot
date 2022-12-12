<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;

/**
 * Class Permission
 * @method static byName($name)
 */
class Permission extends Model
{
    public $timestamps = false;

    const ReadOnly      = 'read_only';
    const ListManager   = 'list_manager';
    const PriceEditor   = 'price_editor';

    protected $fillable = ['name', 'label'];


    /**
     * @param EloquentBuilder $b
     * @param string $name
     * @return EloquentBuilder
     */
    function scopeByName(EloquentBuilder $b, $name)
    {
        return $b->where('name', $name);
    }

    static function getPermissionId($type)
    {
        return static::byName($type)->firstOrFail()->id;
    }

}
