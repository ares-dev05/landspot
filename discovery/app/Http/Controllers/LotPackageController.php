<?php

namespace App\Http\Controllers;

use App\Events\EstateUpdated;
use App\Http\Requests\LotPackageRequest;
use App\Models\{
    Estate, Facade, ImageFromPDF, Lot, LotPackage, Permission, Range, Stage
};
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class LotPackageController extends Controller
{
    /**
     * @param LotPackageRequest $request
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function index(LotPackageRequest $request)
    {
        $this->authorize('view', $request->lot->stage);

        return $this->listLotPackagesForUpload($request, $request->lot);
    }

    /**
     * @param LotPackageRequest $request
     * @return array
     * @throws \Exception
     */
    public function store(LotPackageRequest $request)
    {
        $this->authorize('view', $request->lot->stage->estate);

        return ImageFromPDF::storeToTempFolder($request->image);
    }

    /**
     * @param LotPackageRequest $request
     * @return array
     * @throws \Exception
     */
    public function update(LotPackageRequest $request)
    {
        $lot = $request->lot;
        $user = auth()->user();

        $this->authorize('updateLotPackages', $lot);

        if ($lot->stage->sold) {
            throw new \Exception('Stage is sold out');
        }
        $packagesCount = $lot
            ->lotPackage()
            ->where('company_id', '=', $user->company_id)
            ->count();
        $i = 0;

        $companyId = $user->company_id;

        if (is_array($request->packages)) {
            while ($i < count($request->packages)) {
                $package = $request->packages[$i++];
                $packageData = $package['packageData'] ?? false;
                $uploadedFile = $package['uploadedFile'] ?? [];
                if (is_array($packageData)) {
                    $facadeId = $packageData['facade_id'] ?? 0;
                    $facade = Facade::findOrFail($facadeId);
                    $this->authorize('view', $facade->house);

                    $lotPackageId = $packageData['id'] ?? false;
                    $price = min(max(0, (int)Arr::get($packageData, 'price', 0)), 2147483648);

                    $data = [
                        'facade_id' => $facadeId,
                        'price' => $price
                    ];

                    if ($lotPackageId) {
                        $lotPackage = $lot->lotPackage()->findOrFail($lotPackageId);
                    } else {
                        if ($packagesCount++ >= LotPackage::maxPackagesPerLot) {
                            continue;
                        }
                        $lotPackage = $lot->lotPackage()->create([
                            'company_id' => $companyId,
                            'name' => '',
                            'price' => $price,
                            'facade_id' => $facadeId
                        ]);
                    }

                    if ($uploadedFile) {
                        $data['name'] = Arr::get($uploadedFile, 'fileName', 'Noname');
                        $tempFilename = Arr::get($uploadedFile, 'name');

                        if ($tempFilename == '') throw  new \Exception('Invalid name');
                        $data['path'] = ImageFromPDF::moveTemporaryFileToStorage($tempFilename . '.pdf', 'lot_packages');
                        $data['thumb'] = ImageFromPDF::moveTemporaryFileToStorage('thumb_' . $tempFilename . '.png', 'lot_packages');
                    }

                    $lotPackage->update($data);
                }

            }
        }

        try {
            broadcast(new EstateUpdated($lot->stage->estate, $lot->visibility));
        } catch (\Exception $e) {
            logger()->info("Broadcast EstateUpdated event");
            logger()->error($e->getMessage());
        }

        $result = $lot->stage->estate->filterStagesWithLots($request->get('filters', []), $user);
        $result['ajax_success'] = 'Changes are saved';

        return $result;
    }

    /**
     * @param LotPackageRequest $request
     * @return array
     * @throws \Exception
     */
    public function destroy(LotPackageRequest $request)
    {
        $user = auth()->user();
        $lot = $request->lotPackage->lot;

        $this->authorize('updateLotPackages', $lot);

        if ($lot->stage->sold) {
            throw new \Exception('Stage is sold out');
        }
        $request->lotPackage->delete();

        try {
            broadcast(new EstateUpdated($lot->stage->estate, $lot->visibility));
        } catch (\Exception $e) {
            logger()->info("Broadcast EstateUpdated event");
            logger()->error($e->getMessage());
        }

        $result = $lot->stage->estate->filterStagesWithLots($request->get('filters', []), $user);
        $result['ajax_success'] = 'Package has been deleted';

        return $result;
    }

    /**
     * @param LotPackage $package
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     * @throws \Exception
     */
    function previewPDF(LotPackage $package)
    {
        $this->authorize('view', $package);
        $package->append('fileURL');

        config(
            ['title' =>
                "Land Package for LOT {$package->lot->lot_number} - {$package->lot->stage->estate->name} stage {$package->lot->stage->name}"
            ]);

        return view('layouts.pdf-viewer', $package->toArray());
    }

    /**
     * @param Request $request
     * @param Lot $lot
     * @return mixed
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    protected function listLotPackagesForUpload(Request $request, Lot $lot)
    {
        $packageOffset = (int)$request->get('upload_package');
        $ranges = auth()->user()->getUserRanges();

        if ($packageOffset >= 0 && $packageOffset < 3) {
            $rangeId = $request->get('range_id');
            $houseId = $request->get('house_id');
            $range = null;

            $availableHouses = [];
            $availableFacades = [];

            if ($rangeId) {
                $range = Range::findOrFail($rangeId);
                $this->authorize('view', $range);
                $availableHouses = $range->house()->orderBy('title')->get(['id', 'title']);
            } else {
                $houseId = null;
            }

            if ($houseId) {
                $house = $range->house()->findOrFail($houseId);
                $availableFacades = $house->facades()->orderBy('title')->get(['id', 'title']);
            }

            $response['availableData_' . $packageOffset] = [
                'ranges' => $ranges,
                'houses' => $availableHouses,
                'facades' => $availableFacades,
            ];

            return $response;
        }

        $packages = $lot
            ->lotPackage()
            ->where(function ($b) {
                $b->companyPackage();
            })
            ->limit(LotPackage::maxPackagesPerLot)
            ->orderBy('id');

        $packages = $packages->get();
        $remainingPackagesCount = LotPackage::maxPackagesPerLot - $packages->count();
        while ($remainingPackagesCount-- > 0) {
            $packages->add($lot->lotPackage()->make());
        }

        $response['lotPackages'] = $packages;
        $withFileURL = !auth()->user()->can('updateLotPackages', $lot);

        $packages->each(function (LotPackage $package, $key) use (&$response, $ranges, $withFileURL) {
            if ($package->id && $withFileURL) {
                $package->append('fileURL');
            }
            $response['availableData_' . $key] = [
                'ranges' => $ranges,
                'houses' => $package->availableHouses,
                'facades' => $package->availableFacades,
            ];
        });

        return $response;
    }

    /**
     * @param Request $request
     * @param Estate $estate
     * @return \Illuminate\View\View|array
     * @throws \Exception
     */
    function showLotPackages(Request $request, Estate $estate)
    {
        $this->authorize('view', $estate);
        $stageId = $request->get('stage_id');
        if (!$request->expectsJson()) {
            return view('user.spa', ['rootID' => 'landspot-estates', 'googleMap' => true]);
        }
        $estate->setVisible(['id', 'name', 'stage']);
        $estate->load('stage');
        $stage = null;

        if ($stageId) {
            /** @var Stage $stage */
            $stage = $estate->stage->keyBy('id')->get($stageId);
            if ($stage) {

                $lots = $stage
                    ->lots()
                    ->with('lotPackage.company')
                    ->whereHas('lotPackage')
                    ->get(['id', 'lot_number']);

                $lots->each(function (Lot $lot) {
                    $lot->lotPackage->each(function (LotPackage $package) {
                        $package->append('fileURL');
                    });
                });

                $stage->setRelation('lots', $lots);
            }
        }

        return compact('estate', 'stage');
    }
}
