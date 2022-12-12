<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
/**
 * Class LotPackage
 * @property Lot lot
 * @property int id
 * @property int lot_id
 * @property int company_id
 * @property int created_at
 * @property int updated_at
 * @property string path
 * @property string name
 * @property string thumb
 * @property string thumbImage
 * @property int facade_id
 * @property int price
 * @property Facade facade
 * @property Collection availableHouses
 * @property Collection availableFacades
 * @method static forPastDay(...$args)
 */
class LotPackage extends Model implements FileStorageInterface
{
    use FileStorageTrait;

    protected $table      = 'lot_packages';
    protected $dateFormat = 'U';
    protected $fillable   = ['lot_id', 'company_id', 'path', 'name', 'thumb', 'facade_id', 'price'];
    protected $appends    = ['thumbImage'];
    protected $hidden     = ['path', 'thumb'];
    public $timestamps    = true;

    const fileStorageFields = ['path', 'thumb'];

    const maxPackagesPerLot = 3;

    public function lot()
    {
        return $this->belongsTo(Lot::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    function facade()
    {
        return $this->belongsTo(Facade::class);
    }

    function getThumbImageAttribute()
    {
        return $this->thumb ? ImageFromPDF::storageTempUrl($this->thumb, now()->addDay(2)) : null;
    }

    function getFileURLAttribute()
    {
        return $this->path ? ImageFromPDF::storageTempUrl($this->path, now()->addDay(2)) : null;
    }

    function getAvailableHousesAttribute()
    {
        if (!$this->facade_id) return [];

        return $this->facade->house->range->house()->orderBy('title')->get(['id', 'title']);
    }

    function getAvailableFacadesAttribute()
    {
        if (!$this->facade_id) return [];

        return $this->facade->house->facades()->orderBy('title')->get(['id', 'title']);
    }

    function scopeCompanyPackage(EloquentBuilder $b)
    {
        $user = auth()->user();
        if ($user->company->isBuilder()) {
            $b->where('company_id', $user->company_id);
        }

        return $this;
    }

    function scopeForPastDay(EloquentBuilder $b, $operator = 'and')
    {
        $endDate   = today()->endOfDay()->getTimestamp();
        $startDate = today()->startOfDay()->getTimestamp();
        $b->whereRaw(\DB::raw("`{$this->getTable()}`" . '.`updated_at`') . " BETWEEN " . \DB::raw((int)$startDate) . " AND " . \DB::raw((int)$endDate), [], $operator);

        return $b;
    }

    function scopeForLastHour(EloquentBuilder $b, $operator = 'and')
    {
        $endDate   = now()->subHour()->getTimestamp();
        $startDate = now()->getTimestamp();
        return $b->whereRaw(\DB::raw("`{$this->getTable()}`" . '.`updated_at`') . " BETWEEN " . \DB::raw((int)$startDate) . " AND " . \DB::raw((int)$endDate), [], $operator);
    }

    static function getFilesStorageFields()
    {
        return static::fileStorageFields;
    }
}
