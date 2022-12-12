<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Company
 * @property int builder_id
 * @property int chas_discovery
 * @property int chas_footprints
 * @property int id
 * @property string name
 * @property string type
 *
 * @property Estate estate
 * @property Range range
 * @property User user
 *
 * @method static Company firstOrCreate(...$args)
 * @method static Company firstOrNew(...$args)
 * @method static Company whereIn(...$args)
 */
class ThemeColor extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'theme_colors';
    public $timestamps = false;

    protected $fillable = ['tid', 'name', 'color'];
}
