<?php

namespace App\Models;

use App\Models\Estate;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Support\Str;

/**
 * Class LotAttributes
 * @property int estate_id
 * @property int order
 * @property Estate estate
 * @property string attr_name
 * @property string display_name
 * @property string column_type
 */
class LotAttributes extends Model
{
    protected $fillable = [
        'estate_id', 'attr_name', 'display_name', 'color', 'order', 'column_type'
    ];

    public $timestamps = false;

    public static function boot()
    {
        parent::boot();
        static::creating(function (LotAttributes $item) {
            if ($item->order === null) {
                $amount      = LotAttributes::where('estate_id', $item->estate_id)
                    ->select(\DB::raw('max(`order`) as m'))
                    ->get()
                    ->first()
                    ->toArray();
                $item->order = $amount['m'] == null ? 0 : $amount['m'] + 1;
            }

            return true;
        });

        static::saving(function (LotAttributes $lotAttributes) {
            $lotAttributes->estate()->touch();
        });

        static::deleting(function (LotAttributes $lotAttributes) {
            $lotAttributes->estate()->touch();
        });
    }

    public function estate()
    {
        return $this->belongsTo(Estate::class);
    }

    function scopeStaticColumns(EloquentBuilder $b)
    {
        return $b->where('column_type', 'static');
    }

    function scopeDynamicColumns(EloquentBuilder $b)
    {
        return $b->where('column_type', 'dynamic');
    }

    function scopeByDisplayOrAttrName(EloquentBuilder $b, $displayName, $attrName = null)
    {
        if ($attrName == '') {
            $attrName = self::generateAttrNameFromDisplayName($displayName);
        }

        return $b->where(function (EloquentBuilder $q) use ($displayName, $attrName) {
            $q->where('display_name', 'like', $displayName, 'or');
            $q->where('display_name', 'like', Str::slug($displayName, '_'), 'or');
            $q->where('attr_name', 'like', $attrName, 'or');
            $q->where('attr_name', 'like', Str::slug($displayName, '_'), 'or');
        });
    }

    static function generateAttrNameFromDisplayName($displayName)
    {
        return 'd_' . Str::slug($displayName, '_');
    }
}
