<?php

namespace App\Http\Controllers\Lotmix;

use App\Http\Controllers\LandDevController;
use App\Models\{BuyerType, Company, House, Region, State};
use App\Models\Lotmix\Company as LotmixCompany;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Routing\Redirector;
use Illuminate\Support\Collection;

class DiscoveryController extends LandDevController
{
    /**
     * Display the specified resource.
     *
     * @param House $house
     * @param Request $request
     * @return Application|RedirectResponse|Response|Redirector
     */
    public function show(House $house, Request $request)
    {
        $this->getHouseOptions($house);

        if ($request->expectsJson()) {
            return response(['house' => $house]);
        }

        return redirect('landspot.discovery');
    }

    /**
     * @param Request $request
     * @return JsonResponse|RedirectResponse
     */
    function filter(Request $request)
    {
        if (!$request->expectsJson()) {
            return redirect()->route('landspot.discovery');
        }

        $userFilters = $request->only([
            'beds',
            'single',
            'double',
            'bathrooms',
            'width',
            'depth',
            'min',
            'max',
            'title'
        ]);

        $companies = Company::getBriefAdminCompanies();

        $statesList = State::all()->pluck('id')->toArray();

        $companiesIds = $companies->keys()->toArray();

        $data = House::countAvailableHouses(
            $companiesIds,
            $userFilters,
            $statesList
        );

        $companies = $data->map(function ($item) use($companies){
            $companies[$item->id]->houses_count = $item->houses_count ?? 0;
            return $companies[$item->id];
        });

        $filters = House::getHouseDistinctParameters($companiesIds, $userFilters, $statesList);

        return response()->json([
            'companies' => $companies,
            'filters' => $filters,
            'buyerTypes' => BuyerType::get(['name', 'id']),
            'regions' => Region::get(['name', 'id']),
        ]);
    }

    /**
     * @param Request $request
     * @param $slug
     * @return array|RedirectResponse
     */
    public function filterHouses(Request $request, $slug)
    {
        if (!\request()->expectsJson()) {
            return redirect()->route('landspot.discovery');
        }

        $lotmixCompanyId = LotmixCompany::whereSlug($slug)->first()->id;
        $company = Company::findOrFail($lotmixCompanyId);

        $userFilters = $request->only(
            ['beds', 'bathrooms', 'depth', 'double', 'house', 'max', 'min', 'single', 'width', 'title']
        );

        $userFilters['range'] = $company->getLotmixUserFilters()->toArray();

        $houses = House::getFilteredCollection(
            $userFilters,
            ['*'],
            LengthAwarePaginator::resolveCurrentPage(),
            'title'
        );
        $houses->each(function (House $house) {
            $house->randomFacadeImage = true;
        });

        $availableHousesNames = House::getFilteredCollection($userFilters, ['id', 'title']);
        $titles = $this->getHouseTitles($availableHousesNames);


        return compact('houses', 'titles');
    }

    /**
     * Helpers
     */

    /**
     * @param $houses
     * @return Collection
     */
    protected function getHouseTitles($houses): Collection
    {
        /** @var Collection $houseTitles */
        $houseTitles = $houses->sortBy('title')->values();
        $houseTitles = $houseTitles->map(function ($item) {
            return ['id' => $item['id'], 'name' => $item['title']];
        });

        return $houseTitles;
    }

    /**
     * @param House $house
     * @return $this|DiscoveryController
     */
    protected function getHouseOptions(House $house): DiscoveryController
    {
        $houseRelations = [
            'attributes',
            'floorplans',
            'options',
            'volume'
        ];

        if (\request()->has('siting')) {
            $house->siting = $house->siting()->first(['id', 'facade']);
        }

        $house->load($houseRelations);

        $house->range->builderCompany;
        $house['checkOptions'] = false;
        $house['gallery'] = [];
        $house['builderCompanyId'] = optional($house->range)->builderCompanyId;

        $house['overview3DUrl'] = null;
        $house['canFindLots'] = true;
        $house['hidePrintBrochure'] = true;

        return $this;
    }

}
