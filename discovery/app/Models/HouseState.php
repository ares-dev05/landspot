<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @method static get(...$args)
 */
class HouseState extends Model
{
    protected $table = 'house_states';
    protected $fillable = ['name', 'abbrev'];
}