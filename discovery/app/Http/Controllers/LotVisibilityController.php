<?php

namespace App\Http\Controllers;

use App\Events\EstateUpdated;
use App\Http\Requests\LotVisibilityRequest;
use App\Models\Lot;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class LotVisibilityController extends Controller
{
    /**
     * Display the specified resource.
     *
     * @param Lot $lot
     * @return array
     * @throws \Exception
     */
    public function show(Lot $lot)
    {
        $this->authorize('update', $lot);

        $builderCompanies = Auth::user()->getBuilderCompanies();

        return [
            'lotNumber' => $lot->lot_number,
            'globalVisibility' => $lot->visibility,
            'selectedCompanies' => $lot->lotVisibility->pluck('company_id'),
            'builderCompanies' => array_values($builderCompanies)
        ];
    }

    /**
     * Update the specified resource in storage.
     *
     * @param LotVisibilityRequest $request
     * @param Lot $lot
     * @return array
     * @throws \Exception
     */
    public function update(Lot $lot, LotVisibilityRequest $request)
    {
        $this->authorize('update', $lot);
        $user = auth()->user();

        $builderCompanies = Auth::user()->getBuilderCompanies();
        if ($request->allChecked) {
            $lot->visibility = Lot::visibility['all'];
        }

        if ($request->allUnchecked) {
            $lot->visibility = Lot::visibility['disabled'];
        }

        if ($request->customOptionsChecked && $request->selectedOptions) {
            $lot->visibility = Lot::visibility['partial'];
            $lot->lotVisibility()->delete();
            foreach ($request->selectedOptions as $companyId) {
                if (isset($builderCompanies[$companyId])) {
                    $lot->lotVisibility()->create(['company_id' => $companyId]);
                }
            }
        }
        $lot->save();

        try {
            broadcast(new EstateUpdated($lot->stage->estate));
        } catch (\Exception $e) {
            logger()->info("Broadcast EstateUpdated event");
            logger()->error($e->getMessage());
        }

        return $lot->stage->estate->filterStagesWithLots($request->filters, $user);
    }

    /**
     * @param Lot $lot
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Illuminate\Validation\ValidationException
     */
    public function updateLotmixLotVisibility(Lot $lot)
    {
        $user = auth()->user();
        $this->authorize('update', $lot);
        $this->authorize('manage-my-clients');

        $postData = $this->validate(
            request(),
            [
                'filters' => 'present|array',
                'visibility' => [
                    'present',
                    'nullable',
                    Rule::in(array_values(Lot::lotmixVisibility))
                ]
            ]
        );

        $lot->update([
            'lotmix_visibility' => $postData['visibility']
        ]);

        return $lot->stage->estate->filterStagesWithLots($postData['filters'], $user);
    }
}
