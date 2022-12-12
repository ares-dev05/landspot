<?php

namespace App\Http\Controllers;

use App\Models\{EstateManager, House, InvitedUser, LandDeveloper, State};
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;
use Illuminate\Routing\Redirector;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class LandDevController extends Controller
{
    function filter(Request $request)
    {
        if (!\request()->expectsJson()) {
            return redirect()->route('landspot.discovery');
        }
        /**
         * @var LandDeveloper|EstateManager|InvitedUser $user
         */
        $user    = Auth::user();
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

        $companies = $user->getBuilderCompanies();

        foreach ($companies as &$company) {
            $company['houses_count'] = 0;
        }

        $statesList = State::all()->pluck('id')->toArray();
        if (!$user->isGlobalAdmin()) {
            $statesList = $user->getStatesList()->toArray();
        }

        $companiesIds = array_keys($companies);
        $data         = House::countAvailableHouses(
            $companiesIds,
            $userFilters,
            $statesList
        );

        foreach ($data as $item) {
            $companies[$item->id]['houses_count'] = $item->houses_count;
        }

        $filters = House::getHouseDistinctParameters($companiesIds, $userFilters, $statesList);

        $companies = array_filter(array_values($companies), function ($item) {
            return $item['houses_count'] > 0;
        });

        return response()->json([
            'companies' => array_values($companies),
            'filters'   => $filters
        ]);
    }

    function company(Request $request, $companyId)
    {
        if (!\request()->expectsJson()) {
            $company = Auth::user()->builderCompany()->find($companyId);
            if (!$company) return redirect()->route('landspot.discovery');

            return view('user.spa', ['rootID' => 'developer-discovery']);
        }
    }

    public function filterHouses(Request $request, $companyId)
    {
        /**
         * @var LandDeveloper|EstateManager $user
         */
        $user = Auth::user();

        if (!\request()->expectsJson()) {
            return redirect()->route('landspot.discovery');
        }

        $company = $user->builderCompany()->findOrFail($companyId);

        $userFilters = $request->only(
            ['beds', 'bathrooms', 'depth', 'double', 'max', 'min', 'single', 'width']
        );


        $statesList = $user->isGlobalAdmin()
            ? State::all(['id'])->pluck('id')->toArray()
            : $statesList = $user->getStatesList()->toArray();


        $userFilters['range'] = $company->range()->whereIn('state_id', $statesList)->get(['id'])->pluck('id')->toArray();
        $houses = House::getFilteredCollection(
            $userFilters,
            ['*'],
            LengthAwarePaginator::resolveCurrentPage(),
            'title'
        );
        $houses->each(function (House $house) {
            $house->randomFacadeImage = true;
        });

        return compact('houses');
    }

    /**
     * Display the specified resource.
     *
     * @param House $house
     * @param Request $request
     * @return Application|RedirectResponse|Response|Redirector
     * @throws AuthorizationException
     */
    public function show(House $house, Request $request)
    {
        $this->authorize('view', $house);

        $this->getHouseOptions($house);

        if ($request->expectsJson()) {
            return response(['house' => $house]);
        }

        return redirect('landspot.discovery');
    }

    //refactor, move to model
    protected function getHouseOptions(House $house)
    {
        $house->load(
            'attributes',
            'facades',
            'floorplans',
            'gallery',
            'options',
            'volume',
            'range'
        );
        $house['checkOptions'] = false;
        $house['builderCompanyId'] = optional($house->range)->builderCompanyId;

        foreach ($house->options as $option) {
            if ($option->path) {
                $house['checkOptions'] = true;
                break;
            }
        }
        $house['overview3DUrl'] = optional($house->volume)->path;
        $house['canFindLots'] = auth()->user()->can('estates-access');
        $house['hidePrintBrochure'] = false;

        return $this;
    }
}
