<?php

namespace App\Models\Sitings;

use Illuminate\Database\Eloquent\Model;

/**
 * Class DrawerData
 * @property int id
 * @property int siting_id
 * @property int page_id
 * @property int rotation
 * @property int view_scale
 * @property int north_rotation
 * @property int mirrored
 * @property string data
 * @property string sitingSession
 * @property Siting siting
 * @property ReferencePlanPage page
 */
class DrawerData extends Model
{
    protected $table = 'sitings_drawer_data';
    protected $fillable = [
        'siting_id', 'page_id', 'page_id_engineering', 'rotation', 'north_rotation', 'view_scale', 'data', 'mirrored'
    ];

    protected $hidden = [
        'id', 'siting_id', 'data'
    ];

    public $timestamps = false;

    function siting()
    {
        return $this->belongsTo(Siting::class);
    }

    function page()
    {
        return $this->belongsTo(ReferencePlanPage::class, 'page_id');
    }

    function engineeringPage()
    {
        return $this->belongsTo(EngineeringPlanPage::class, 'page_id_engineering');
    }

    function getSitingSessionAttribute()
    {
        return $this->data ? zlib_decode(base64_decode($this->data)) : null;
    }

    function setDataAttribute($value)
    {
        $this->attributes['data'] = self::__encode($value);
    }

    /**
     * @param LegacySiting $legacySiting
     */
    function migrate($legacySiting)
    {
        if ($legacySiting) {
            $this->data = $legacySiting->canvasModel;
            $this->rotation = $legacySiting->rotation;
            $this->view_scale = 1;
            $this->north_rotation = 0;
            $this->mirrored = 0;
            $this->save();
        }
    }

    static function __encode($data)
    {
        if (!is_string($data)) {
            $data = json_encode($data);
        }
        return base64_encode(zlib_encode($data, ZLIB_ENCODING_GZIP));
    }

    static function __decode($data)
    {
        return zlib_decode(base64_decode($data));
    }
}