<?php

namespace App\Http\Controllers;

use App\Events\EstateUpdated;
use App\Http\Requests\LotBulkUpdateRequest;
use App\Http\Requests\LotRequest;
use App\Models\Lot;
use App\Models\Stage;
use Illuminate\Support\Arr;

class LotController extends Controller
{
    /**
     * @param LotRequest $request
     * @return array
     * @throws \Exception
     */
    public function store(LotRequest $request)
    {
        /**
         * @var Stage
         */
        $stage = $request->stage;
        $estate = $stage->estate;
        $user = auth()->user();

        $this->authorize('createLots', $stage);

        if ($stage->sold) throw new \Exception('Stage is sold');
        $columnValues = $request->columnValues;

        $staticColumns = $request->staticColumns;

        $lotStaticValues = [];
        foreach ($staticColumns as $attr_name => $attr_id) {
            if (isset($columnValues[$attr_id])) {
                if ($attr_name == 'price') {
                    if ($user->can('updatePrice', $estate)) {
                        $lotStaticValues[$attr_name] = $columnValues[$attr_id];
                    } else {
                        $lotStaticValues[$attr_name] = null;
                    }
                } else {
                    $lotStaticValues[$attr_name] = $columnValues[$attr_id];
                }
            } else {
                if ($attr_name == 'price') {
                    $lotStaticValues[$attr_name] = null;
                } else {
                    $lotStaticValues[$attr_name] = '';
                }
            }
        }

        if (isset($columnValues['lot_number'])) {
            $lotStaticValues['lot_number'] = $columnValues['lot_number'];
        }

        if (isset($columnValues['visibility'])) {
            $lotStaticValues['visibility'] = $columnValues['visibility'];
        } else {
            $lotStaticValues['visibility'] = Lot::visibility['all'];
        }

        $lot = $stage->lots()->create($lotStaticValues);

        $dynamicColumns = $estate
            ->lotAttributes()
            ->where('column_type', 'dynamic')
            ->get()
            ->pluck('id', 'display_name');

        if (count($dynamicColumns) > 0) {

            $lotDynamicValues = [];
            foreach ($dynamicColumns as $displayName => $lotAttrID) {
                if (isset($columnValues[$lotAttrID])) {
                    $lotDynamicValues[] = [
                        'lot_attr_id' => $lotAttrID,
                        'value' => $columnValues[$lotAttrID]
                    ];
                }
            }
            $lot->lotValues()->createMany($lotDynamicValues);
        }

        try {
            broadcast(new EstateUpdated($estate, $lot->visibility));
        } catch (\Exception $e) {
            logger()->info("Broadcast EstateUpdated event");
            logger()->error($e->getMessage());
        }

        return $estate->filterStagesWithLots($request->filters, $user);
    }

    /**
     * @param LotRequest $request
     * @param Lot $lot
     * @return array
     * @throws \Exception
     */
    public function update(LotRequest $request, Lot $lot)
    {
        $this->authorize('update', $lot);
        $estate = $lot->stage->estate;
        $user = auth()->user();

        $columnValues = $request->columnValues;

        $staticColumns = $request->staticColumns;

        $statusColumnId = $staticColumns->get('status');
        $canUpdatePrice = $user->can('updatePrice', $estate);

        foreach ($staticColumns as $attr_name => $attr_id) {
            if (isset($columnValues[$attr_id])) {
                if ($attr_name == 'price') {
                    if ($canUpdatePrice) {
                        $lot->{$attr_name} = $columnValues[$attr_id];
                    }
                } else {
                    $lot->{$attr_name} = $columnValues[$attr_id];
                }
            }
            if ($canUpdatePrice && $attr_name === 'price' &&
                array_key_exists($attr_id, $columnValues) &&
                Arr::get($columnValues, $statusColumnId) === 'Sold' &&
                Arr::get($columnValues, $attr_id) === null
            ) {
                $lot->{$attr_name} = null;
            }
        }
        $lot->save();

        $dynamicColumns = $estate->lotAttributes()->where('column_type', 'dynamic')
            ->get()
            ->pluck('id', 'display_name');

        if (count($dynamicColumns) > 0) {

            foreach ($dynamicColumns as $displayName => $lotAttrID) {
                if (isset($columnValues[$lotAttrID])) {
                    $lot->lotValues()->updateOrCreate(
                        [
                            'lot_attr_id' => $lotAttrID
                        ],
                        [
                            'lot_attr_id' => $lotAttrID,
                            'value' => $columnValues[$lotAttrID]
                        ]
                    );
                }
            }
        }

        try {
            broadcast(new EstateUpdated($estate, $lot->visibility));
        } catch (\Exception $e) {
            logger()->info("Broadcast EstateUpdated event");
            logger()->error($e->getMessage());
        }

        return $estate->filterStagesWithLots($request->filters, $user);
    }

    /**
     * @param LotRequest $request
     * @param Lot $lot
     * @return array
     * @throws \Exception
     */
    public function destroy(LotRequest $request, Lot $lot)
    {
        $this->authorize('delete', $lot);
        $user = auth()->user();

        $estate = $lot->stage->estate;
        $lot->delete();

        try {
            broadcast(new EstateUpdated($estate));
        } catch (\Exception $e) {
            logger()->info("Broadcast EstateUpdated event");
            logger()->error($e->getMessage());
        }

        return $estate->filterStagesWithLots($request->filters, $user);
    }

    /**
     * @param LotBulkUpdateRequest $request
     * @return array
     */
    public function bulkUpdate(LotBulkUpdateRequest $request): array
    {
        Lot::find($request->lotIds)->each(function ($item) use ($request) {
            $value = $request->value;
            if ($request->columnName === 'price') {
                $value = $item->{$request->columnName} + $value;
                $value = $value < 0
                    ? 0
                    : ($value > 1e8
                        ? 1e8
                        : $value);

            }
            $item->{$request->columnName} = $value;
            $item->save();
            return $item;
        });

        return $request->estate->filterStagesWithLots($request->filters);
    }
}
