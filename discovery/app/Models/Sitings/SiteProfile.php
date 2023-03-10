<?php

namespace App\Models\Sitings;

use Illuminate\Database\Eloquent\Model;

/**
 * Class DrawerData
 * @property int id
 * @property int company_id
 * @property int state_id
 * @property string zone
 * @property string subzone
 * @property string suburb
 * @property string estate
 * @property string costs_data
 * @property string rules_data
 */
class SiteProfile extends Model
{
    protected $table = 'site_profiles';
    protected $fillable = ['company_id', 'state_id', 'zone', 'subzone', 'suburb', 'estate', 'costs_data', 'rules_data'];
    protected $hidden   = ['id', 'company_id', 'state_id', 'costs_data', 'rules_data'];
    protected $appends  = ['costs', 'rules'];

    public $timestamps = false;


    public function builderCompany()
    {
        return $this->belongsTo(Company::class, 'company_id', 'id');
    }

    function getCostsAttribute()
    {
        return $this->costs_data ? self::__decode($this->costs_data) : null;
    }
    function setCostsAttribute($value)
    {
        $this->attributes['costs_data'] = self::__encode($value);
    }

    function getRulesAttribute()
    {
        return $this->rules_data ? self::__decode($this->rules_data) : null;
    }
    function setRulesAttribute($value)
    {
        $this->attributes['rules_data'] = self::__encode($value);
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