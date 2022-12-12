<?php

namespace App\Http\Controllers;

use App\Events\{
    EstateCreated, EstateUpdated
};
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\View\Factory;
use Illuminate\View\View;
use App\Http\Requests\{NewEstateRequest,
    StoreEstateAmenity,
    UpdateEstateAnswer,
    UpdateEstateDescription,
    UpdateEstateSnapshot,
    UpdateEstateRequest,
    UploedEstateImages};
use App\Models\{Estate, EstateFaq, EstateGallery, EstateSnapshot, File, House, HouseState, InvitedUser, Region, User};
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class EstatesController extends Controller
{
    /**
     * List estates with lots count
     *
     * @param Request $request
     * @return array|\Illuminate\Http\RedirectResponse
     * @throws Exception
     */
    public function filterEstates(Request $request)
    {
        if (!\request()->expectsJson()) {
            return redirect()->route('landspot.my-estates');
        }
        $filters = $request->all();
        /** @var User $user */
        $user = auth()->user();
        if ($user->company->isBuilder()) {
            $filters['builder_company'] = $user->company_id;
            $filters['published'] = 1;
        }
        $estates = $user->getEstatesLotCount($filters);
        $estates->map(function ($item) {
            if ($item->geo_coords) {
                $coords = explode(',', $item->geo_coords);
                settype($coords[0], 'float');
                settype($coords[1], 'float');
            } else {
                $coords = null;
            }

            $item->geo_coords = $coords;
            $item->small = Estate::getValidPath($item->small ?? $item->path);
            unset($item->path);
        });

        $filters = $this->getSidebarFilters();
        $isBuilder = $user->company->isBuilder();

        $response = [
            'filters' => $filters,
            'estates' => $estates,
            'house_states' => HouseState::orderBy('name')->get(),
            'regions' => Region::orderBy('name')->get(),
            'isBuilder' => $isBuilder,
            'can_approve' => $user->can('approve-estate'),
            'canCreateEstates' => $user->can('developer-admin')
        ];

        if ($request->has('from_house')) {
            $house = House::findOrFail($request->get('from_house'));
            $this->authorize('view', $house);
            $response['selected_house'] = $house;
        }

        return $response;
    }

    /**
     * @return array
     */
    protected function getSidebarFilters()
    {
        /** @var Collection $lots */
        $lots = auth()->user()->getDistinctLotAttributes();

        $filters['price_max'] = $lots->max('price')
            ? $this->roundUpToIncrement($lots->max('price'))
            : 0;
        $filters['price_min'] = $lots->min('price')
            ? $this->roundDownToIncrement($lots->min('price'))
            : 0;
        $filters['status'] = $lots->pluck('status')->unique()->sort()->values();

        return $filters;
    }

    /**
     * @param int $n
     * @param int $increment
     * @return int
     */
    protected function roundUpToIncrement($n, $increment = 1000)
    {
        return (int)($increment * ceil($n / $increment));
    }

    /**
     * @param int $n
     * @param int $increment
     * @return int
     */
    protected function roundDownToIncrement($n, $increment = 1000)
    {
        return (int)($increment * floor($n / $increment));
    }

    /**
     * @param $key
     * @param Request $request
     * @return Factory|View|array
     * @throws AuthorizationException
     */
    function show(Request $request, $key)
    {
        $estate = Estate::findOrFail($key);
        /** @var InvitedUser $user */
        $user = auth()->user();
        $this->authorize('view', $estate);

        if ($request->expectsJson()) {
            $response = $estate->filterStagesWithLots($request->all(), $user);

            if (object_get($request, 'filters', false)) {
                $response['filters'] = $this->getSidebarFilters();
            }

            return $response;
        }

        return view('user.spa', ['rootID' => 'landspot-estates', 'googleMap' => true]);
    }

    /**
     * @param UpdateEstateRequest $request
     * @param Estate $estate
     * @return array
     * @throws Exception
     */
    function update(UpdateEstateRequest $request, Estate $estate)
    {
        $this->authorize('update', $estate);

        if (auth()->user()->can('approve-estate') && $request->logoFileName != '') {
            $estate->generateThumbnails(basename($request->logoFileName));
        }

        $data = $request->only([
            'name', 'suburb', 'address', 'contacts', 'website', 'published', 'lat', 'long', 'approved',
            'confirmed_at', 'lotmix_public', 'message', 'region_id'
        ]);

        if ($request->has('lat') && $request->has('long')) {
            $data['geo_coords'] = (float)$data['lat'] . ',' . (float)$data['long'];
        }

        if ($data['confirmed_at'] ?? false) {
            $estate->setUpdatedAt($data['confirmed_at']);
        }

        $estate->update($data);

        $estate->load('houseState');
        $estate->append('isConfirmedAccurate');

        try {
            broadcast(new EstateUpdated($estate));
        } catch (Exception $e) {
            logger()->info("Broadcast EstateUpdated event");
            logger()->error($e->getMessage());
        }

        $ESTATE_UPDATED = true;
        return compact('estate', 'ESTATE_UPDATED');
    }

    /**
     * @param NewEstateRequest $request
     * @throws Exception
     */
    function store(NewEstateRequest $request)
    {
        $data = $request->all();
        /** @var User $user */
        $user = auth()->user();

        $this->authorize('createEstate', $user->company);

        HouseState::findOrFail($request->state_id);
        $data['geo_coords'] = (float)$data['lat'] . ',' . (float)$data['long'];

        /** @var Estate $estate */
        $estate = $user->company->estate()->create($data);

        if ($request->logoFileName != '') {
            $estate->generateThumbnails(basename($request->logoFileName));
            $estate->save();
        }
        event(new EstateCreated($estate, $user));
    }

    /**
     * @param Estate $estate
     * @param UpdateEstateDescription $request
     * @return array
     * @throws AuthorizationException
     */
    public function updateDescription(UpdateEstateDescription $request, Estate $estate): array
    {
        $this->authorize('update', $estate);
        $estate = $estate->update([
            'description' => $request->description,
            'description_secondary' => $request->description_secondary,
            'description_suburb' => $request->description_suburb,
        ]);
        return compact('estate');
    }

    /**
     * @param Estate $estate
     * @param UploedEstateImages $request
     * @return void|array
     * @throws AuthorizationException
     */
    public function uploadEstateImages(UploedEstateImages $request, Estate $estate)
    {
        $this->authorize('update', $estate);

        if ($estate->estateGallery->count() + count($request->file('files')) > 4) {
            return abort(422, 'There should be up to 4 pictures at the estate');
        }
        $gallery = [];
        foreach ($request->file('files') as $file) {
            $savedFile = File::moveUploadedFileToStorage($file, 'estate-gallery');
            $gallery[] = [
                'path' => $savedFile['storagePath'],
                'name' => $savedFile['fileName']
            ];
        }
        $estateGallery = $estate->estateGallery()->createMany($gallery);
        $success = 'Images uploaded.';

        return compact('estateGallery', 'success');
    }

    /**
     * @param Estate $estate
     * @param EstateGallery $estateImage
     * @return void|array
     * @throws AuthorizationException
     * @throws Exception
     */
    public function deleteEstateImage(Estate $estate, EstateGallery $estateImage)
    {
        $this->authorize('update', $estate);
        $estate->estateGallery->contains($estateImage);
        $message = 'Image has not been deleted!';
        $estate_gallery = [];
        if ($estateImage->deleteFile()) {
            $message = 'Image has been deleted!';
            $estate_gallery = EstateGallery::where('estate_id', $estate->id)->get();
        }

        return compact('message', 'estate_gallery');
    }

    /**
     * @param StoreEstateAmenity $request
     * @param Estate $estate
     * @return void|array
     * @throws AuthorizationException
     */
    public function addAmenity(StoreEstateAmenity $request, Estate $estate)
    {
        $this->authorize('update', $estate);
        $estate->estateAmenities()->create($request->all());
        $sortEstateAmenities = $estate->sortEstateAmenities;

        return compact('sortEstateAmenities');
    }

    /**
     * @param UpdateEstateSnapshot $request
     * @param Estate $estate
     * @return array
     * @throws AuthorizationException
     */
    public function updateSnapshots(UpdateEstateSnapshot $request, Estate $estate): array
    {
        $this->authorize('update', $estate);
        $estate_snapshots = $request->all();
        foreach ($estate_snapshots as $item) {
            $type = EstateSnapshot::TYPES[$item['type_name']];
            $estate->estateSnapshots()->updateOrCreate(
                ['estate_id' => $estate->id, 'type' => $type],
                [
                    'name' => $item['name'],
                    'type' => $type,
                    'distance' => $item['distance']
                ]);
        }
        return compact('estate_snapshots');
    }

    /**
     * @param UpdateEstateAnswer $request
     * @param Estate $estate
     * @return array
     * @throws AuthorizationException
     */
    public function updateAnswers(UpdateEstateAnswer $request, Estate $estate): array
    {
        $this->authorize('update', $estate);
        $estate_faq = $request->all();
        foreach ($estate_faq as $item) {
            $type = EstateFaq::QUESTIONS[$item['question_name']];
            $estate->estateFaq()->updateOrCreate(
                ['estate_id' => $estate->id, 'question_type' => $type],
                [
                    'question_type' => $type,
                    'answer' => $item['answer']
                ]);
        }
        return compact('estate_faq');
    }
}