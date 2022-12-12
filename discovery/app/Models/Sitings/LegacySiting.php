<?php

namespace App\Models\Sitings;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\{
    Model, Builder as EloquentBuilder
};

/**
 * Class LegacySiting
 *
 * @property int id
 * @property int uid
 * @property int cid
 * @property string name
 * @property string data
 * @property string first_name
 * @property string last_name
 * @property string lot_number
 * @property string street
 * @property string extra_details
 * @property object session
 * @property object canvasModel
 * @property float rotation
 * @property int house_svgs_id
 * @property string house
 * @property string facade
 * @property string options
 * @method static LegacySiting find(...$args)
 */
class LegacySiting extends Model
{
    /**
     * Storage table for legacy siting sessions
     * @var string
     */
    protected $table = 'sitting_sessions';

    /**
     * No timestamps needed as we are only reading from the table
     * @var bool
     */
    public $timestamps = false;

    /**
     * Hidden fields
     * @var array
     */
    protected $hidden  = ['uid', 'name', 'data', 'session', 'canvasModel'];

    /**
     * Extra fields
     * @var array
     */
    protected $appends = [
        // User details
        'first_name',
        'last_name',
        'lot_number',
        'street',
        'extra_details',
        // Sitting Session Details
        'session',
        'canvasModel',
        'rotation',
        'house_svgs_id',
        'house',
        'facade',
        'options',
        'status',
        'page_scale',
        'updated_at'
    ];


    protected static function boot()
    {
        parent::boot();

        static::retrieved(function (LegacySiting $siting) {
            try {
                // Decode the siting session data
                $decoded = self::parseSitingSessionData($siting->data);
                
                $siting->session      = json_decode($decoded);
                $siting->canvasModel  = $siting->session->canvasModel;
                $siting->rotation     = $siting->session->canvasRotation ?? 0;
                $siting->updated_at   = strtotime($siting->date);

                if (!$siting->canvasModel) {
                    return;
                }

                // Fill in user details, if they are available
                if (isset($siting->canvasModel->clientDetails)) {
                    $clientDetails = $siting->canvasModel->clientDetails;
                    $siting->first_name    = $clientDetails->firstName;
                    $siting->last_name     = $clientDetails->lastName;
                    $siting->lot_number    = $clientDetails->lotNumber;
                    $siting->street        = $clientDetails->address;
                    $siting->extra_details = $clientDetails->extraDetails;
                }

                // Fill in house details, if available
                if (isset($siting->canvasModel->multiFloors) && sizeof($siting->canvasModel->multiFloors->layers)) {
                    $houseData           = $siting->canvasModel->multiFloors->layers[0];

                    // Fetch the house name from house_svgs
                    $siting->house_svgs_id = $houseData->houseId;
                    $houses = DB::table('house_svgs')->where('id', $siting->house_svgs_id)->get();
                    if ($houses->count()===1) {
                        $siting->house = $houses[0]->name;
                    }

                    $options = [];
                    $siting->facade = '';
                    foreach ($houseData->layers as $houseLayer) {
                        if (strpos($houseLayer->groupId, 'facade_')===0 && $houseLayer->visible) {
                            $siting->facade = str_replace(
                                'X5F_', ' ',
                                strtoupper(substr($houseLayer->groupId, 7))
                            );
                        }   else
                            if (strpos($houseLayer->groupId, 'option_')===0 && $houseLayer->visible) {
                                $options []= str_replace(
                                    'X5F_', ' ',
                                    strtoupper(substr($houseLayer->groupId, 7))
                                );
                            }
                    }

                    $siting->options = join(', ', $options);

                    // Cleanup unused memory
                    if ($siting->getPersistSessionData() === false) {
                        unset($siting->data);
                        unset($siting->session);
                        unset($siting->canvasModel);
                    }
                }
            }   catch (\Exception $exception) {
                // throw $exception;
            }
        });
    }

    /**
     * By default, we don't persist the session data after decoding, to avoid memory leaks
     * @return bool
     */
    public function getPersistSessionData() { return false; }

    public function getFirstNameAttribute() {
        return $this->attributes['first_name'] ?? '';
    }
    public function getLastNameAttribute() {
        return $this->attributes['last_name'] ?? '';
    }
    public function getLotNumberAttribute() {
        return $this->attributes['lot_number'] ?? '';
    }
    public function getStreetAttribute() {
        return $this->attributes['street'] ?? '';
    }
    public function getExtraDetailsAttribute() {
        return $this->attributes['extra_details'] ?? '';
    }
    public function getRotationAttribute() {
        return $this->attributes['rotation'] ?? '';
    }
    public function getHouseSvgsIdAttribute() {
        return $this->attributes['house_svgs_id'] ?? '';
    }
    public function getHouseAttribute() {
        return $this->attributes['house'] ?? '';
    }
    public function getFacadeAttribute() {
        return $this->attributes['facade'] ?? '';
    }
    public function getOptionsAttribute() {
        return $this->attributes['options'] ?? '';
    }
    public function getStatusAttribute() {
        return Siting::STATUS_IN_PROGRESS;
    }
    public function getPageScaleAttribute() {
        return 200;
    }
    public function getUpdatedAtAttribute() {
        return $this->attributes['updated_at'] ?? time();
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'uid', 'id');
    }

    /**
     * @param EloquentBuilder $b
     * @param $id
     * @return EloquentBuilder
     */
    function scopeByUser(EloquentBuilder $b, $id)
    {
        return $b->where('uid', $id);
    }

    /**
     * @param EloquentBuilder $b
     * @param int $id ID of the legacy siting
     * @return EloquentBuilder
     */
    function scopeById(EloquentBuilder $b, $id)
    {
        return $b->where($b->qualifyColumn('id'), $id);
    }


    /**
     * @param string $legacy Saved session data in legacy format
     * @return string
     * @throws \Exception
     */
    static private function parseSitingSessionData($legacy) {
        // The legacy format uses encoded 64KB UTF blocks, with the first 2 bytes in each block representing the length
        // The blocks are separated by a '{BLOCK_SEP}' keyboard
        $parts = explode('{BLOCK_SEP}', $legacy);
        $data  = '';

        foreach ($parts as $block) {
            $data .= substr(DrawerData::__decode($block), 2);
        }
        return $data;
    }
}