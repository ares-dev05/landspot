<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class NotificationMedia
 *
 * @method static NotificationMedia findOrFail(...$id)
 * @method static NotificationMedia find(...$id)
 * @method static NotificationMedia create(...$args)
 * @property int id
 * @property string path
 * @property string name
 * @property string thumb
 * @property string small
 */
class NotificationMedia extends Model
{
    protected $table = 'notification_media';

    protected static $storageFolder = 'notification_media';

    use ResizeImageTrait;

    function __construct(array $attributes = [])
    {
        self::$imageSizes = ['thumb', 'small'];

        return parent::__construct(...func_get_args());
    }

    protected $fillable = [
        'path', 'name', 'thumb', 'small', 'mediable_id', 'mediable_type'
    ];
    protected $hidden = ['path', 'thumb', 'small', 'mediable_id', 'mediable_type'];

    public $timestamps = false;

    protected $appends = ['thumbImage', 'smallImage'];
}
