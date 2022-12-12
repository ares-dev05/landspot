<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Support\Facades\DB;

/**
 * Class GlobalSiteSettings
 * @property string type
 * @property string value
 * @method static byType($type)
 */
class GlobalSiteSettings extends Model
{
    protected $table = 'global_site_settings';
    public $timestamps = false;

    protected $fillable = [
        'type',
        'value'
    ];

    const settingsJobEmailNotifications = 'job_email_notifications';

    protected $guarded = ['type'];

    function scopeByType(EloquentBuilder $b, $type)
    {
        return $b->where('type', $type);
    }

    protected static function boot()
    {
        parent::boot();

        static::updated(function (GlobalSiteSettings $e) {
            $originalValue = $e->getOriginal('value');
            $type          = $e->getAttributeFromArray('type');
            $value         = $e->getAttributeFromArray('value');

            switch ($type) {
                case GlobalSiteSettings::settingsJobEmailNotifications:
                    if ($originalValue !== $value) {
                        DB::table(config('queue.connections.database.table'))->truncate();
                    }
            }
        });
    }
}
