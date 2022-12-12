<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HouseSvgs extends Model
{
    protected $fillable = [
        'range_id', 'name', 'url', 'to_mm_factor', 'area_data'
    ];


    public function houseRange()
    {
        return $this->belongsTo(Range::class, 'range_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getCollection()
    {
        $ranges = Range::getUserRanges()->pluck('id');
        return HouseSvgs::whereIn('range_id', $ranges)->get();
    }

    static function fixUpdatedAtTimeStamp()
    {
        self::where('updated_at', '0000-00-00 00:00:00')
            ->update(['updated_at' => \DB::raw('CURRENT_TIMESTAMP')]);
    }
}
