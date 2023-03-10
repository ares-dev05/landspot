<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\BuildOptionRequest;
use App\Http\Resources\Api\BuildOptionCollection;
use App\Http\Resources\Api\BuildOptionResource;
use App\Models\Company;
use App\Models\Estate;
use App\Models\House;
use App\Models\State;
use App\Models\User;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

class BuildOptionController extends Controller
{
    /**
     *
     * Display a listing of the resource.
     *
     * @param BuildOptionRequest $request
     * @return BuildOptionCollection
     * @throws Exception
     */
    public function index(BuildOptionRequest $request): BuildOptionCollection
    {
        /** @var User $user $company */
        $user = auth()->user();

        if (!$company = $user->company) {
            throw new Exception('No company found for this user');
        }

        $houseFilters = $this->prepareHouseFilters($request->validated(), $company);

        $houses = House::getFilteredCollectionWithLots(
            $houseFilters,
            ['*'],
            LengthAwarePaginator::resolveCurrentPage(),
            'id',
            $request->per_page ?? 60
        );

        return new BuildOptionCollection($houses);
    }

    /**
     *
     * Display the specified resource.
     *
     * @param $id
     * @return BuildOptionResource
     * @throws Exception
     */
    public function show($id): BuildOptionResource
    {
        $houseId = substr($id, 0, strpos($id, '_'));
        $estateId = substr($id, strpos($id, '_') + 1);
        $house = House::with('attributes')->findOrFail($houseId);
        $estates = House::appendLotsToHouse($house);
        if(!$estate = $estates->firstWhere('id' ,'=', $estateId)){
            throw new Exception('Estate not found', 404);
        }

        $house->estate = $estate;

        return new BuildOptionResource($house);
    }

    /**
     * @return JsonResponse
     */
    public function getAvailableSuburbs(): JsonResponse
    {
        $state = State::byAbbrev('vic')->firstOrFail();
        $estates = Estate::byState($state)->lotmixPublic()->get();
        $suburbs = $estates->map(function (Estate $estate) {
            return $estate->suburb;
        })->unique()->values();
        return response()->json(['data' => $suburbs]);
    }

    /**
     * @param array $filters
     * @param Company $company
     * @return array
     */
    private function prepareHouseFilters(array $filters, Company $company): array
    {
        $filters['range'] = $company->getLotmixClientsFilters($filters['suburbs'] ?? null)->toArray();
        unset($filters['suburbs']);
        unset($filters['per_page']);

        $filters['single'] = isset($filters['storey']) && $filters['storey'] == 'single' ? 1 : null;
        $filters['double'] = isset($filters['storey']) && $filters['storey'] == 'double' ? 2 : null;
        unset($filters['storey']);
        $filters['beds'] = isset($filters['beds']) ? (int)$filters['beds'] : null;
        $filters['bathrooms'] = isset($filters['bathrooms']) ? (double)$filters['bathrooms'] : null;

        return $filters;
    }
}
