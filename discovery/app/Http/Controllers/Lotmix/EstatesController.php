<?php

namespace App\Http\Controllers\Lotmix;

use App\Http\Controllers\EstatesController as LsEstatesController;
use App\Models\{Estate, House, InvitedUser, Lot, Lotmix\Company as LotmixCompany, LotPackage, Stage, State};
use App\Models\Lotmix\Estate as LotmixEstate;
use Exception;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\View\Factory;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\View\View;

class EstatesController extends LsEstatesController
{
    /**
     * @param $key
     * @param Request $request
     * @return array
     * @throws Exception
     */
    function show(Request $request, $key): array
    {
        $filters = $request->all();
        $filters['lotmix'] = 1;

        $lotmixEstateId = LotmixEstate::whereSlug($key)->first()->id;
        $estate = Estate::findOrFail($lotmixEstateId);

        $response = $estate->filterStagesWithLots($filters);

        if (object_get($request, 'filters', false)) {
            $response['filters'] = Estate::getLotsSidebarFilters($estate->estateLots);
        }

        return $response;
    }

    /**
     * Returns array of filters, filtered estates and selected house
     *
     * @param Request $request
     * @return array|RedirectResponse
     * @throws Exception
     */
    public function filterEstates(Request $request)
    {
        $filters = $request->all();
        $filters['published'] = 1;
        $filters['lotmix'] = 1;

        [$estates, $lots] = Estate::getEstatesLotCount($filters);

        $estates = Estate::transformCoordsAndSmallImage($estates);

        $filters = Estate::getLotsSidebarFilters($lots);

        $response = [
            'filters' => $filters,
            'estates' => $estates,
            'isBuilder' => false,
        ];

        if ($request->has('from_house')) {
            $house = House::findOrFail($request->get('from_house'));
            $response['selected_house'] = $house;
        }



        return $response;
    }

    /**
     * @param string $abbrev
     * @param string $suburb
     * @param string $estateSlug
     * @return array|Factory|View|mixed
     */
    public function getPublicEstatePage(string $abbrev, string $suburb, string $estateSlug)
    {
        $state = State::byAbbrev($abbrev)->firstOrFail();
        $suburb = str_replace('-', ' ', $suburb);
        $estates = Estate::byState($state)
            ->bySuburb($suburb)
            ->lotmixPublic()
            ->get();

        $estate = $estates->filter(function ($estate) use ($estateSlug) {
            return Str::slug($estate->name) == $estateSlug;
        })->first();
        if (!$estate) {
            abort(404, 'Estate was not found');
        }
        $this->attachEstateDetails($estate);

        if (request()->expectsJson()) {
            return compact('estate');
        }
        // build view details
        $title = $estate ? "$estate->name Estate | Land for sale | Lotmix" : 'Lotmix';
        $description = $estate ? substr("$estate->description $estate->description_secondary", 0, 140) : '';

        // Fetch all builders with discovery and estates access
        $houses = House::whereHas('facades')
            ->withAndWhereHas('company', function ($query) {
                $query->where($query->qualifyColumn('type'), 'builder')
                    ->whereHas('user', function ($q) {
                        $q->where('is_brief_admin', true);
                    })
                    ->where([
                        $query->qualifyColumn('type') => 'builder',
                        'chas_discovery' => 1
                    ])
                    ->where(function (EloquentBuilder $q) {
                        $q->where([
                            'chas_footprints' => 1,
                            'chas_estates_access' => 1,
                        ])->orWhere([
                            'chas_footprints' => 0
                        ]);
                    })
                    ->where([
                        'chas_lotmix' => 1
                    ]);
            })
            ->with('facades')
            ->byState($state)
            ->byDiscovery(House::DISCOVERY_ENABLE)
            ->inRandomOrder()
            ->limit(3)
            ->get();

        return view('lotmix.land-estate.estate', compact('state', 'estate', 'title', 'description', 'houses'));
    }

    /**
     * Creates an estate catalogue, grouped by suburb
     * @param string $abbrev
     * @return array
     */
    public function getPublicEstates(string $abbrev): array
    {
        $state = State::byAbbrev($abbrev)->firstOrFail();
        $estates = Estate::byState($state)->lotmixPublic()->get();
        $catalogue = [];
        $suburbs = [];

        foreach ($estates as $estate) {
            $suburbs[$estate->suburb_slug] = $estate->suburb;

            if (!isset($catalogue[$estate->suburb_slug])) {
                $catalogue[$estate->suburb_slug] = [];
            }

            $estate->append(['slug', 'suburb_slug']);
            $this->attachEstateDetails($estate);

            $catalogue[$estate->suburb_slug] [] = $estate;
        }

        asort($suburbs);

        return [
            'catalogue' => (object)$catalogue,
            'suburbs' => (object)$suburbs,
            'state' => $state
        ];
    }

    /**
     * Creates an estate catalogue, grouped by suburb
     * @param $abbrev
     * @return array|Application|Factory|View
     */
    public function getEstateLocator(string $abbrev)
    {
        $state = State::byAbbrev($abbrev)->firstOrFail();

        return view('lotmix.land-estate.estate-locator', [
            'title' => 'Land For Sale | ' . $state->name,
            'description' => "Discover Land Estates in $state->abbrev and find the perfect lot of land for sale.  Browse the newest Land Estates across Melbourne, $state->name."
        ]);
    }

    /**
     * @param Request $request
     * @return mixed
     */
    public function getAutocompleteEstate(Request $request)
    {
        $request->validate([
            'search' => ['required', 'string'],
        ]);
        $search = $request->search;
        if ($search == '') {
            $estates = Estate::lotmixPublic()->get();
        } else {
            $estates = Estate::lotmixPublic()->where('name', 'like', '%' . $search . '%')->get();
        }
        $estates->each->append(['slug', 'suburb_slug']);

        return $estates;
    }

    /**
     * Helpers
     */

    /**
     * @param Estate $estate
     */
    private function attachEstateDetails(Estate $estate)
    {
        $estate->append('sortEstateAmenities');
        $estate->load(['estateGallery', 'estateSnapshots', 'estateFaq']);
        $estate->geo_coords = Estate::transformCoordsToArray($estate->geo_coords);
        $estate->makeVisible(['small', 'thumb']);
        $estate->small = Estate::getValidPath($estate->small ?? $estate->path);
    }


    //TODO: deprecated
    /**
     * @param Request $request
     * @param Estate $estate
     * @return array
     * @throws Exception
     */
    function estateLotPackages(Request $request, Estate $estate): array
    {
        $stageId = $request->get('stage_id');
        $estate->setVisible(['id', 'name', 'stage', 'smallImage']);
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

    /**
     * @param Estate $estate
     * @return array
     */
    public function getUserEstate(Estate $estate)
    {
        $users = InvitedUser::allBriefAdmins();
        $estateDocuments = $users->flatMap(function (InvitedUser $user) use ($estate) {
            $estate->load(['lots' => function ($b) use ($user) {
                $b->where('lotmix_visibility', Lot::lotmixVisibility['visible']);
                $b->with('lotPackage');
            }]);
            return $user->documentsByEstateId($estate->id);
        })->unique('id');
        $estateDocuments->each->append('fileURL');

        $this->attachEstateDetails($estate);

        $estate->lots->each->append(['lotImage', 'drawerTheme']);

        $estate->lots_count = $estate->lots->count();

        $shortlistLotsIds = $users->flatMap(function (InvitedUser $user) use ($estate) {
            return $user->getShortListsByEstateId($estate->id)->pluck('lot_id');
        })->unique('id');

        $company = $estate->company;
        $randomHouses = $company->getRandomHousesWithFacades(3);

        return compact('estate', 'estateDocuments', 'shortlistLotsIds', 'randomHouses', 'company');
    }
}
