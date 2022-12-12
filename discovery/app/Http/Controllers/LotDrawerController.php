<?php

namespace App\Http\Controllers;

use App\Jobs\DrawerThemeRebuildJob;
use App\Services\DrawerThemeRebuilder\DrawerThemeRebuilder;
use App\Models\{
    Estate, File, Lot, LotDrawerData, LotDrawerTheme, Stage, StageDoc
};
use Illuminate\Database\Eloquent\{
    Builder as EloquentBuilder, Relations\BelongsTo, Relations\HasMany, Relations\HasOne
};
use Illuminate\Support\{
    Arr, Str
};

class LotDrawerController extends Controller
{
    /**
     * @param Estate $estate
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    function getEstateData(Estate $estate)
    {
        $this->authorize('premiumFeature', [$estate, 'lot-drawer']);

        $estate->setVisible(['id', 'name', 'stage']);
        $estate->load(['stage' => function (HasMany $b) {
            $b->whereHas('stageDocs', function (EloquentBuilder $b) {
                $b->posDocument();
            })
                ->whereHas('lots')
                ->with('lots');
        }]);

        return compact('estate');
    }

    /**
     * @param Lot $lot
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Exception
     */
    function getStagePos(Lot $lot)
    {
        /** @var Stage $stage */
        $stage = $lot->stage;

        $this->authorize('premiumFeature', [$stage->estate, 'lot-drawer']);
        /** @var StageDoc $pos */
        $pos = $stage->getPosDocument();

        if ($pos->pages->isEmpty()) {
            $pos->convertFile();
        }

        $stage->load('estate:id');
        $pos->load('pages');
        $lot->load('drawerData');
        $lot->setVisible(['id', 'stage', 'lot_number', 'drawerData']);

        return compact('lot', 'pos');
    }

    /**
     * @param Lot $lot
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Exception
     */
    function getLotDrawerData(Lot $lot)
    {
        /** @var Stage $stage */
        $stage = $lot->stage;
        $this->authorize('premiumFeature', [$stage->estate, 'lot-drawer']);

        $lotData = $lot->drawerData()->firstOrCreate([]);
        $lotData->load(['page', 'lot' => function (BelongsTo $b) {
            $b->select(['id', 'lot_number', 'stage_id']);
        }]);
        $lotData->estate_id = $stage->estate_id;
        $lotData->setVisible(['edges', 'page', 'rotation', 'lot', 'estate_id']);

        return compact('lotData');
    }

    /**
     * @param Lot $lot
     * @param bool $authorize
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    function getLotSettings(Lot $lot, $authorize = true)
    {
        /** @var Stage $stage */
        $stage = $lot->stage;
        if ($authorize) {
            $this->authorize('premiumFeature', [$stage->estate, 'lot-drawer']);
        }

        $lotData = $lot->drawerData()->firstOrCreate([]);
        $lotData->load(['lot' => function (BelongsTo $b) {
            $b->select(['id', 'lot_number', 'stage_id']);
        }]);
        $lotData->estate_id = $stage->estate_id;
        $lotData->setVisible(['details', 'edges', 'easements', 'lot', 'rotation', 'estate_id', 'view_scale']);

        $drawerTheme = $stage->drawerTheme()->firstOrCreate([]);
        if ($drawerTheme->wasRecentlyCreated) {
            $drawerTheme = $drawerTheme->fresh();
        }
        $drawerTheme->append('backgroundImage');
        $drawerTheme->setVisible(['theme', 'backgroundImage']);

        return compact('lotData', 'drawerTheme');
    }

    /**
     * @param Lot $lot
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Exception
     */
    function saveLotDrawerData(Lot $lot)
    {
        /** @var Stage $stage */
        $stage = $lot->stage;

        $this->authorize('premiumFeature', [$stage->estate, 'lot-drawer']);
        $data = $this->validate(\request(), [
            'pageId'    => 'integer|exists:stage_doc_pages,id|nullable',
            'edges'     => 'array|nullable',
            'easements' => 'array|nullable',
            'theme'     => 'array|nullable',
            'rotation'  => 'integer|min:-180|max:180|nullable',
            'viewScale' => 'numeric|min:0|max:10|nullable',
            'nextStep'  => 'integer|required',
            'complete'  => 'boolean|nullable',
            'lotImage'  => 'string|required_if:complete,true',
        ]);

        $drawerData = [];
        foreach ($data as $column => $value) {
            if ($value !== null) {
                switch ($column) {
                    case 'pageId':
                        $drawerData['page_id'] = $value;
                        break;
                    case 'viewScale':
                        $drawerData['view_scale'] = $value;
                        break;
                    case 'edges':
                    case 'easements':
                        $drawerData[$column] = json_encode($value);
                        break;
                    case 'theme':
                        $this->processLotDetails($lot, $value);
                        break;
                    case 'rotation':
                        $drawerData[$column] = $value;
                        break;
                }
            }
        }

        $complete = $data['complete'] ?? null;
        if ($complete) {
            $drawerData['is_completed'] = 1;

            $lotImage = Arr::get(request(), 'lotImage', '');
            $fileName = Str::random(40) . '.svg';

            if ($lotImage) {
                $filePath = File::generateOSTempfilename('.svg');
                file_put_contents($filePath, urldecode(base64_decode($lotImage)));
                File::storeToTempFolderFromPath($filePath, $fileName);
                $path = File::moveTemporaryFileToStorage($fileName, LotDrawerData::$storageFolder);

                $drawerData = array_merge($drawerData, compact('path'));
            }
        }

        $lot->drawerData()->updateOrCreate([], $drawerData);

        // Only dispatch a theme rebuild event if this stage has a theme assigned.
        if ($lot->stage && $lot->stage->drawerTheme) {
            $this->dispatch(new DrawerThemeRebuildJob($lot->stage->drawerTheme->id));
        }

        return $complete
            ? $this->getLotSettings($lot, false)
            : ['nextStep' => $data['nextStep']];
    }

    /**
     * @param Lot $lot
     * @param array $theme
     * @return \Illuminate\Database\Eloquent\Model
     * @throws \Exception
     */
    protected function processLotDetails(Lot $lot, array $theme)
    {
        $uploadedFile = $theme['uploadedFile'] ?? null;

        $path = '';

        if ($uploadedFile) {
            $path = File::moveTemporaryFileToStorage(
                $uploadedFile['name'],
                LotDrawerTheme::$storageFolder
            );
            $theme['uploadedFile'] = null;
        }

        $theme = json_encode($theme);
        $stage = $lot->stage;
        $stage_id = $stage->id;

        return $stage->drawerTheme()->updateOrCreate(
            [],
            compact('stage_id', 'theme', 'path')
        );
    }

    /**
     * @param Lot $lot
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    function getDialogData(Lot $lot)
    {
        $this->authorize('lotDrawerDialog', [$lot->stage->estate, 'lot-drawer']);

        $estate           = $lot->stage->estate;
        $response         = $this->getLotSettings($lot, false);
        $response['lots'] = $estate->drawnLots();

        return $response;
    }
}
