<?php

namespace App\Models;

use App\Events\BrowserNotification;
use App\Models\StageDoc;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Support\Collection;

/**
 * Class Stage
 * @property Estate estate
 * @property int id
 * @property int estate_id
 * @property int published
 * @property int sold
 * @property Lot lots
 * @property StageDoc stageDocs
 * @property LotDrawerTheme drawerTheme
 * @property string name
 * @method Stage findOrFail($id)
 * @method companyLotTheme()
 */
class Stage extends Model
{
    use WithAndWhereHasTrait;

    protected $table = 'stages';
    public $timestamps = false;

    protected $fillable = ['estate_id', 'name', 'published', 'sold'];
    protected $hidden = ['estate_id'];

    public function estate()
    {
        return $this->belongsTo(Estate::class);
    }

    public function lots()
    {
        return $this->hasMany(Lot::class);
    }

    public function stageDocs()
    {
        return $this->hasMany(StageDoc::class);
    }

    public function drawerTheme()
    {
        return $this->hasOne(LotDrawerTheme::class);
    }

    public function formulaValue()
    {
        return $this->morphMany(FormulaValue::class, 'reference');
    }


    protected static function boot()
    {
        parent::boot();
        static::deleting(function (Stage $s) {
            $s->lots()->each(function (Lot $lot) {
                $lot->delete();
            });

            $s->stageDocs()->each(function (StageDoc $doc) {
                $doc->delete();
            });

            $s->drawerTheme()->each(function (LotDrawerTheme $drawerTheme) {
                $drawerTheme->delete();
            });

            if ($s->published) {
                $s->estate()->touch();
            }
        });

        static::saving(function (Stage $s) {
            if ($s->getAttributeFromArray('sold')) {
                $s->published = 1;
            }

            if ($s->getOriginal('published') || $s->published) {
                $s->estate()->touch();
            }
        });

        static::updated(function (Stage $s) {
            if ($s->sold && !$s->getOriginal('sold')) {
                $s->lots()->update(['status' => 'Sold']);
            }

            $s->sendNotificationToBuilder();
        });
    }

    protected function sendNotificationToBuilder()
    {
        $estate = $this->estate;
        $isActiveEstate = $estate->published && $estate->approved;
        $isPublishedStage = $this->published && !$this->getOriginal('published');

        if ($isPublishedStage && $isActiveEstate) {
            try {
                $notification = [
                    'title' => 'A new stage was added',
                    'icon' => $estate->thumbImage,
                    'onClickUrl' => $estate->publicUrl,
                    'text' => "The estate {$estate->name} has just publish a new stage"
                ];
                broadcast(new BrowserNotification($estate->getBrowserNotificationChannel('builder-'), $notification));
            } catch (\Exception $e) {
                logger()->info("Broadcast BrowserNotification event");
                logger()->error($e->getMessage());
            }
        }
    }

    function scopePublished(EloquentBuilder $b)
    {
        return $b->where('published', 1);
    }

    function scopeUnsold(EloquentBuilder $b)
    {
        return $b->where('sold', 0);
    }

    /**
     * @param $stageIds
     * @param bool $unSold
     * @param int $exportVisibilityType
     * -1: All lots - EXCLUDING builder exclusives
     * -2: All lots - Not currently visible to builders
     * -3: All visible lots and use specified builder company id
     *  0: All lots
     * {value: 0, title: 'All lots'}
     * @param int $builderCompanyId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    static function getLotsForExport($stageIds, $unSold, $exportVisibilityType, $builderCompanyId)
    {
        $stages = self::with(['lots' => function (HasMany $lot) use ($exportVisibilityType, $builderCompanyId, $unSold) {
            if ($exportVisibilityType != Lot::exportVisibility['all']) {
                $lot->visibleToCompany($exportVisibilityType, $builderCompanyId);
            }

            if ($unSold) $lot->unsoldOnly();
            //$lot->orderBy('lot_number')
            $lot->orderByRaw("CAST(lot_number AS DECIMAL(10,2)) ASC")
                ->select(Lot::query()->qualifyColumn('*'));
        }])
            ->whereIn('id', $stageIds);

        if ($unSold) {
            $stages->whereHas('lots', function (EloquentBuilder $b) {
                $b->where('status', 'Available');
            });
        }

        return $stages->get();
    }

    function getPosDocument()
    {
        return $this->stageDocs()->posDocument()->first();
    }

    function getLotsWithColumns($unsoldLots)
    {
        $filters['stage_id'] = $this->id;
        $filters['estate_id'] = $this->estate_id;
        if ($unsoldLots) {
            $filters['status'] = 'Available';
        }
        $columns = $this->estate->listColumnsByOrder();
        $lotsCollection = Lot::getFilteredCollection(
            $filters,
            $columns
        );

        $lots = $lotsCollection->map(function ($item) {
            unset($item->id, $item->lot_visibility, $item->lot_packages);

            return array_values((array)$item);
        });

        return compact('lots', 'columns');
    }

    function scopelotBuilderCompanies(EloquentBuilder $b)
    {
        return $b
            ->join('lots', 'lots.stage_id', '=', 'stages.id')
            ->join('lots_visibility', 'lots_visibility.lot_id', '=', 'lots.id')
            ->join('companies', 'companies.id', '=', 'lots_visibility.company_id')
            ->addSelect('companies.id', 'companies.name')
            ->distinct();
    }
}
