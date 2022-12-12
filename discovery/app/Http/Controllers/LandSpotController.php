<?php

namespace App\Http\Controllers;

use App\Events\EstateUpdated;
use App\Http\Requests\{
    AddNewLotColumn, MoveColumnRequest, UploadPriceListRequest
};
use App\Models\{
    Lot, LotAttributes, Estate, Stage, ImageWithThumbnails
};
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Http\Requests\UploadImageRequest;
use Maatwebsite\Excel\Collections\RowCollection;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Support\Str;

class LandSpotController extends Controller
{

    /**
     * @param AddNewLotColumn $request
     * @return array|\Illuminate\Http\JsonResponse
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function addNewEstateColumn(AddNewLotColumn $request)
    {
        $estate = Estate::findOrFail($request->estate_id);
        $this->authorize('update', $estate);

        $displayName = $request->display_name;
        $this->checkColumnName($estate, $displayName);

        $estate->lotAttributes()->create([
            'display_name' => $request->display_name,
            'attr_name' => LotAttributes::generateAttrNameFromDisplayName($request->display_name),
            'column_type' => 'dynamic'
        ]);

        return $this->getStagesResponse($estate, $request->filters);
    }

    /**
     * @param Estate $estate
     * @param string $displayName
     */
    protected function checkColumnName(Estate $estate, $displayName)
    {
        $lotAttributes = $estate->lotAttributes()
            ->byDisplayOrAttrName($displayName)
            ->get();

        if (count($lotAttributes) > 0) {
            throw new HttpException(400, "Column {$displayName} already exists.");
        }
    }

    /**
     * @param AddNewLotColumn $request
     * @param LotAttributes $lotAttributes
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    function renameEstateColumn(AddNewLotColumn $request, LotAttributes $lotAttributes)
    {
        $estate = $lotAttributes->estate;
        $this->authorize('update', $estate);

        $display_name = $request->display_name;
        $this->checkColumnName($estate, $display_name);

        $lotAttributes->update(compact('display_name'));

        return $this->getStagesResponse($estate, $request->filters);
    }

    protected function getStagesResponse(Estate $estate, array $filters = [])
    {
        $user = auth()->user();
        try {
            broadcast(new EstateUpdated($estate));
        } catch (\Exception $e) {
            logger()->info("Broadcast EstateUpdated event");
            logger()->error($e->getMessage());
        }

        return $estate->filterStagesWithLots($filters, $user);
    }

    /**
     * @param Request $request
     * @param LotAttributes $attribute
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Exception
     */
    public function removeColumn(LotAttributes $attribute, Request $request)
    {
        $this->authorize('update', $attribute->estate);

        if ($attribute->column_type == 'static') {
            throw new \Exception('This column cannot be deleted');
        }

        $estate = $attribute->estate;
        $attribute->delete();

        return $this->getStagesResponse($estate, $request->filters);
    }

    /**
     * @param MoveColumnRequest $request
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function moveColumn(MoveColumnRequest $request)
    {
        $estate = $request->estate;

        $this->authorize('update', $estate);

        $sortedColumns = $request->sortedColumns;

        foreach ($sortedColumns as $column) {
            LotAttributes::where('id', $column['id'])->update(['order' => $column['order']]);
        }

        return $this->getStagesResponse($estate, $request->filters);
    }

    /**
     * @param \Illuminate\Database\Eloquent\Collection $fields
     * @param Request $request
     * @param $perPage
     * @return LengthAwarePaginator
     */
    protected function getPaginator($fields, Request $request, $perPage)
    {
        $page = LengthAwarePaginator::resolveCurrentPage();

        $slice = $fields->slice(($page - 1) * $perPage, $perPage)->values();
        $paginator = new LengthAwarePaginator($slice, $fields->count(), $perPage, '', ['path' => $request->url()]);

        return $paginator;
    }


    /**
     * @param Request $request
     * @param Estate $estate
     * @return array
     * @throws \Exception
     */
    function addStage(Estate $estate, Request $request)
    {
        $this->authorize('createStage', $estate);
        $this->validate($request, [
            'name' => 'required|string|max:255',
            'filters' => 'present|array'
        ]);
        $estate->stage()->create(['name' => $request->name, 'published' => 0]);

        return $this->getStagesResponse($estate, $request->filters);
    }

    /**
     * @param Request $request
     * @param Stage $stage
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Illuminate\Validation\ValidationException
     */
    function updateStage(Stage $stage, Request $request)
    {
        $this->validate($request, [
            'filters' => 'present|array',
            'published' => 'nullable|boolean',
            'sold' => 'nullable|boolean',
        ]);
        $this->authorize('update', $stage);

        $stage->update($request->only(['sold', 'published']));

        return $this->getStagesResponse($stage->estate, $request->filters);
    }

    /**
     * @param Request $request
     * @param Stage $stage
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Exception
     */
    function removeStage(Stage $stage, Request $request)
    {
        $this->authorize('delete', $stage);
        $this->validate($request, ['filters' => 'present|array']);

        $estate = $stage->estate;
        $stage->delete();

        return $this->getStagesResponse($estate, $request->filters);
    }

    /**
     * @param UploadImageRequest $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \Exception
     */
    public function uploadImage(UploadImageRequest $request)
    {
        $file = $request->file('image');
        if ($file) {
            $trim = $request->get('trim');
            $imageSize = $request->get('imageSize');
            return response()->json(ImageWithThumbnails::storeToTempFolder($file, null, false, $trim ? 5 : 0, $imageSize));
        }
    }

    /**
     * @param UploadPriceListRequest $request
     * @param Stage $stage
     * @return \Illuminate\Http\JsonResponse
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function uploadPriceList(UploadPriceListRequest $request, Stage $stage)
    {
        $this->authorize('createLots', $stage);

        $filename = $request->file->getPathname();
        $reader = Excel::load($filename);

        $data = $reader->get();

        if ($data->count()) {
            $stage->estate->createDynamicAttributesFromArray($this->getSheetColumns($reader));
            $result = $this->storePriceList($data, $stage);
        } else {
            return response()->json(['error' => 'Empty CSV File']);
        }

        try {
            broadcast(new EstateUpdated($stage->estate));
        } catch (\Exception $e) {
            logger()->info("Broadcast EstateUpdated event");
            logger()->error($e->getMessage());
        }

        return response()->json([
            'success' => sprintf(
                'Price successfully imported. Added %u and updated %u lots.',
                $result['new'], $result['updated']
            )
        ]);
    }

    /**
     * @param Request $request
     * @param Stage $stage
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Illuminate\Validation\ValidationException
     */
    function savePriceList(Request $request, Stage $stage)
    {
        $this->authorize('createLots', $stage);
        $statusRegex = 'regex:/^(' . join('|', Lot::status) . ')$/i';
        $data = $this->validate(
            $request,
            [
                'lots' => 'required|array',
                'lots.*.area' => 'nullable|numeric|min:0|max:1000000',
                'lots.*.depth' => 'nullable|numeric|min:0|max:1000000',
                'lots.*.frontage' => 'nullable|string',
                'lots.*.lot_number' => 'nullable|integer|min:0|max:4294967295',
                'lots.*.price' => 'nullable|numeric|min:0|max:100000000',
                'lots.*.status' => ['nullable', 'string', $statusRegex],
                'lots.*.title_date' => 'nullable|string|max:64',
                'filters' => 'present|array',
            ],
            [
                'lots.*.area.*' => 'The area must be a number.',
                'lots.*.depth.*' => 'The depth must be a number.',
                'lots.*.frontage.*' => 'The frontage must be a string.',
                'lots.*.lot_number.*' => 'The lot number must be an integer.',
                'lots.*.price.*' => 'The price must be a number.',
                'lots.*.status.*' => 'The status must be one of "' . join(', ', Lot::status) . '"',
                'lots.*.title_date.string' => 'The title date must be a string',
            ]
        );
        $staticColumns = $stage->estate->lotAttributes()->staticColumns()
            ->orderBy('order')
            ->get(['id', 'attr_name'])
            ->pluck('id', 'attr_name');

        $updated = 0;
        $new = 0;
        $canUpdatePrice = auth()->user()->can('updatePrice', $stage->estate);

        foreach ($data['lots'] as $lotValues) {
            $lotStaticValues = [];
            foreach ($staticColumns as $displayName => $lotAttrID) {
                if (collect($lotValues)->has($displayName)) {
                    $value = $lotValues[$displayName];
                    switch ($displayName) {
//                        case 'frontage':
                        case 'depth':
                        case 'area':
                            $value = (float)$value;
                            if ($value < 0) $value = 0;
                            break;

                        case 'price':
                            if ($value != '') {
                                $value = (float)str_replace(',', '', $value);
                            }
                            if (!$canUpdatePrice) $value = null;
                            break;

                        case 'status':
                            $hasStatus = false;
                            if ($value != '') {
                                $value = mb_strtolower($value);
                                foreach (Lot::status as $key => $status) {
                                    $status = mb_strtolower($status);
                                    if ($status === $value) {
                                        $value = Lot::status[$key];
                                        $hasStatus = true;
                                        break;
                                    }
                                }
                            }
                            if (!$value || !$hasStatus) {
                                $value = 'Sold';
                            }
                            break;
                        default:
                            $value = mb_substr($value, 0, 64);
                    }
                    $lotStaticValues[$displayName] = $value;

                } else {
                    $lotStaticValues[$displayName] = null;
                }
            }

            $lot = null;
            $lotNumber = (int)trim($lotStaticValues['lot_number']);

            if ($lotNumber > 0) {
                $lot = $stage->lots()->byNumber($lotNumber)->get()->first();
            }

            if ($lot) {
                $lot->update($lotStaticValues);
                ++$updated;
            } else {
                $lotStaticValues['visibility'] = Lot::visibility['all'];
                $stage->lots()->create($lotStaticValues);
                ++$new;
            }
        }

        $response = $this->getStagesResponse($stage->estate, $data['filters']);
        $response['ajax_success'] = sprintf(
            'Price successfully imported. Added %u and updated %u lots.',
            $new, $updated
        );

        return $response;
    }

    protected function getSheetColumns($reader)
    {
        $sheet = $reader->getActiveSheet();
        $row = $sheet->getRowIterator(1)->current();
        $columnNames = [];
        foreach ($row->getCellIterator() as $cell) {
            $columnNames[] = $cell->getValue();
        }

        return $columnNames;
    }

    protected function storePriceList(RowCollection $data, Stage $stage)
    {
        $staticColumns = $stage->estate->lotAttributes()->staticColumns()
            ->get(['id', 'attr_name'])
            ->pluck('id', 'attr_name');

        $updated = 0;
        $new = 0;
        $canUpdatePrice = auth()->user()->can('updatePrice', $stage->estate);

        foreach ($data as $row) {
            $lotStaticValues = [];
            foreach ($staticColumns as $displayName => $lotAttrID) {
                if ($row->has($displayName)) {
                    $value = $row[$displayName];
                    switch ($displayName) {
//                        case 'frontage':
                        case 'depth':
                        case 'area':
                            $value = (float)$value;
                            if ($value < 0) $value = 0;
                            break;

                        case 'price':
                            if ($value != '') {
                                $value = (float)str_replace(',', '', $value);
                            }
                            if (!$canUpdatePrice) $value = null;
                            break;
                        default:
                            $value = mb_substr($value, 0, 64);
                    }
                    $lotStaticValues[$displayName] = $value;

                } else {
                    $lotStaticValues[$displayName] = null;
                }
            }

            $lot = null;
            $lotNumber = (int)trim($lotStaticValues['lot_number']);

            if ($lotNumber > 0) {
                $lot = $stage->lots()->byNumber($lotNumber)->get()->first();
            }

            if ($lot) {
                $lot->update($lotStaticValues);
                ++$updated;
            } else {
                $lotStaticValues['visibility'] = Lot::visibility['all'];
                $lot = $stage->lots()->create($lotStaticValues);
                ++$new;
            }

            $dynamicColumns = $lot->stage->estate->lotAttributes()->dynamicColumns()
                ->get()
                ->pluck('id', 'display_name');

            if (count($dynamicColumns) > 0) {
                foreach ($dynamicColumns as $displayName => $lotAttrID) {
                    $keys = array_unique([$displayName, strtolower($displayName), Str::slug($displayName, '_')]);

                    foreach ($keys as $key) {
                        if ($row->has($key)) {
                            $lot->lotValues()->updateOrCreate(
                                ['lot_attr_id' => $lotAttrID],
                                ['value' => $row[$key]]
                            );
                            $row->forget($keys);
                            break;
                        }
                    }
                }
            }
        }

        return [
            'new' => $new,
            'updated' => $updated
        ];
    }
}
