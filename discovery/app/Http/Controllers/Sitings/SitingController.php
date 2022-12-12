<?php

namespace App\Http\Controllers\Sitings;

use App\Http\Controllers\Controller;
use App\Models\Builder;
use App\Models\File;
use App\Models\InvitedUser;
use App\Models\LotmixStateSettings;
use Illuminate\Validation\ValidationException;
use App\Models\Sitings\{Siting};
use Illuminate\Http\Request;
use Illuminate\Support\{
    Arr, Str
};
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use iio\libmergepdf\Merger;
use iio\libmergepdf\Pages;


class SitingController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function create()
    {
        return $this->getPlan($this->__create());
    }

    /**
     * @return Siting
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    private function __create()
    {
        $this->authorize('create', Siting::class);
        return auth()->user()->siting()->create(['status' => Siting::STATUS_NEW]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param Siting $siting
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Illuminate\Validation\ValidationException
     */
    public function show(Siting $siting)
    {
        $this->authorize('update', $siting);

        $data = $this->validate(\request(), [
            'step' => [
                'string',
                'required',
                Rule::in(['edges', 'easements', 'house', 'house-details', 'annotations', 'export'])
            ],
        ]);

        $drawerData = $siting->drawerData()->firstOrCreate([]);

        $appends = ['templateImage', 'xmlURL', 'themeURL', 'userActions', 'houseURL', 'userSettings', 'envelopeURL', 'facadeURL'];
        $sitingColumns = array_merge(['id'], $appends);

        $drawerData->append('sitingSession');
        $drawerColumns = ['rotation', 'view_scale', 'north_rotation', 'mirrored', 'sitingSession'];
        switch ($data['step']) {
            case 'edges':
            case 'easements':
            case 'annotations':
                $drawerData->load(['page', 'engineeringPage']);
                $drawerColumns = array_merge($drawerColumns, ['page', 'engineeringPage']);
                break;
            case 'house':
            case 'house-details':
                break;
            case 'export':
                $sitingColumns = array_merge($sitingColumns, [
                    'first_name', 'last_name', 'lot_number',
                    'street', 'extra_details', 'page_size', 'page_scale',
                    'house',
                    'lot_no', 'sp_no', 'parent_lot_no', 'parent_sp_no',
                ]);
                break;
        }
        $siting->append($appends);
        $drawerData->setVisible($drawerColumns);
        $siting->setVisible($sitingColumns);

        return compact('drawerData', 'siting');
    }

    /**
     * @param Siting $siting
     * @return bool|string
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Exception
     */
    function getCompanyXml(Siting $siting)
    {
        $this->authorize('update', $siting);
        return $siting->getCompanyDataXml();
    }

    /**
     * @param Siting $siting
     * @return bool|string
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Exception
     */
    function getCompanyTheme(Siting $siting)
    {
        $this->authorize('update', $siting);
        return $siting->getCompanyThemeXml();
    }

    /**
     * @param Siting $siting
     * @param int $house
     * @return bool|string
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Exception
     */
    function getHouseData(Siting $siting, $house)
    {
        $this->authorize('update', $siting);
        return $siting->getHouseDataXml($house);
    }

    /**
     * @param Siting $siting
     * @return bool|string
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Exception
     */
    function getEnvelopeCatalogueXml(Siting $siting)
    {
        $this->authorize('update', $siting);
        return $siting->getEnvelopeCatalogueXml();
    }

    /**
     * @param Siting $siting
     * @return bool|string
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Exception
     */
    function getFacadeCatalogueXml(Siting $siting)
    {
        $this->authorize('update', $siting);
        return $siting->getFacadeCatalogueXml();
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @param Siting $siting
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Throwable
     */
    public function update(Request $request, Siting $siting)
    {
        $this->authorize('update', $siting);

        $data = $this->validate($request, [
            'pageId' => 'integer|exists:sitings_ref_plan_pages,id|nullable',
            'pageIdEngineering' => 'integer|exists:sitings_engineering_plan_pages,id|nullable',
            'rotation' => 'numeric|min:-180|max:180|nullable',
            'mirrored' => 'boolean|nullable',
            'viewScale' => 'numeric|min:0|max:10|nullable',
            'northRotation' => 'numeric|nullable',
            'nextStep' => 'integer|required',
            'exportType' => [
                'string',
                'nullable',
                Rule::in(array_values(LotmixStateSettings::SITING_EXPORT_PERMISSIONS))
            ],
            'sitingImage' => [
                'string',
                'required_if:exportType,ASSIGN_TO_CLIENT',
                'required_if:exportType,SAVE_AND_EXPORT',
            ],
            'engineeringImage' => [
                'string',
                'nullable'
            ],
            'nearmapImage' => [
                'string',
                'nullable'
            ],
            'sitingSession' => 'array|nullable',
        ]);

        $invitedUserData = $this->validate($request, [
            'form' => 'array|nullable',
            'form.first_name' => [
                'string',
                'max:155',
                'required_if:exportType,ASSIGN_TO_CLIENT',
            ],
            'form.last_name' => [
                'string',
                'max:155',
                'required_if:exportType,ASSIGN_TO_CLIENT',
            ],
            'form.id' => [
                'integer',
                'exists:invited_users,id',
                'required_if:exportType,ASSIGN_TO_CLIENT',
            ]
        ]);

        $sitingData = $this->validate($request, [
            'siting' => 'array|nullable',
            'siting.page_size' => 'integer|min:0|max:3',
            'siting.page_scale' => 'integer|min:100|max:5000',
            'siting.first_name' => 'required_if:exportType,SAVE_AND_EXPORT|nullable|string|max:155',
            'siting.last_name' => 'required_if:exportType,SAVE_AND_EXPORT|nullable|string|max:155',
            'siting.lot_number' => 'nullable|string|max:155',
            'siting.street' => 'nullable|string|max:155',
            'siting.extra_details' => 'nullable|string|max:255',
            'siting.lot_no' => 'nullable|string|max:32',
            'siting.sp_no' => 'nullable|string|max:32',
            'siting.parent_lot_no' => 'nullable|string|max:32',
            'siting.parent_sp_no' => 'nullable|string|max:32',
        ]);

        $drawerData = [];
        foreach ($data as $column => $value) {
            if ($value !== null) {
                switch ($column) {
                    case 'pageId':
                    case 'pageIdEngineering':
                    case 'viewScale':
                        $drawerData[Str::snake($column)] = $value;
                        break;
                    case 'northRotation':
                        $angle = round($value, 2);
                        while ($angle < 0) $angle += 360;
                        while ($angle >= 360) $angle -= 360;
                        $drawerData[Str::snake($column)] = $angle;
                        break;
                    case 'mirrored':
                    case 'rotation':
                        $drawerData[$column] = $value;
                        break;
                    case 'sitingSession':
                        $drawerData['data'] = $value;
                        break;
                }
            }
        }

        $siting->drawerData()->updateOrCreate([], $drawerData);

        if ($sitingData = Arr::get($sitingData, 'siting', null)) {
            $houseData = Arr::get($data, 'sitingSession.multiFloors.layers.0.houseData', []);
            if (array_key_exists('options', $houseData) && strlen($houseData['options']) > 240) {
                throw ValidationException::withMessages(['options' => 'Options field must be a maximum of 240 characters']);
            }
            $siting->update(array_merge($sitingData, $houseData));
        }

        if (!empty($data['sitingSession']) && !empty($data['sitingSession']['areaData'])) {
            $areaData = $data['sitingSession']['areaData'];
            $lotArea = $areaData['lotArea'];
            $totalCoverage = $areaData['totalCoverage'];
            $siting->update(['lot_area' => $lotArea, 'site_coverage' => $totalCoverage]);
        }

        $exportType = $data['exportType'] ?? null;
        if ($exportType) {
            $EXPORT_COMPLETE = true;
            $OPEN_DIALOG = true;
            $response = compact('OPEN_DIALOG', 'exportType', 'EXPORT_COMPLETE');

            switch ($exportType) {
                case LotmixStateSettings::SITING_EXPORT_PERMISSIONS[LotmixStateSettings::ASSIGN_TO_CLIENT]:
                    $invitation = [];
                    if ($invitedUserData = Arr::get($invitedUserData, 'form', null)) {
                        /** @var InvitedUser $user */
                        $user = InvitedUser::findOrFail($invitedUserData['id']);

                        $invitation = $user->processInvitation($siting);

                        $siting->update([
                            'status' => Siting::STATUS_COMPLETED,
                        ]);
                    }
                    $this->getSitingPdf($siting);
                    return array_merge($response, $invitation);
                case LotmixStateSettings::SITING_EXPORT_PERMISSIONS[LotmixStateSettings::SAVE_AND_EXPORT]:
                    if ($siting->status === Siting::STATUS_NEW) {
                        /** @var InvitedUser $user */
                        $user = InvitedUser::create([
                            'first_name' => $sitingData['first_name'],
                            'last_name' => $sitingData['last_name']
                        ]);

                        $user->processInvitation($siting);

                        $siting->update(['status' => Siting::STATUS_COMPLETED]);
                    }

                    $this->getSitingPdf($siting);
                    return [
                        'nextStep' => $data['nextStep'],
                        'OPEN_DIALOG' => true,
                        'EXPORT_PDF' => true,
                        'ajax_success' => 'Siting was successfully updated'
                    ];
            }
        }

        return ['nextStep' => $data['nextStep']];
    }

    /**
     * @param Siting $siting
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Exception
     * @throws \Throwable
     */
    protected function getSitingPdf(Siting $siting)
    {
        $dualOccupancy = false;
        $this->authorize('update', $siting);
        $areaData = (object)Arr::get(request(), 'sitingSession.areaData', []);
        if (isset($areaData->houseAreas)) {
            $areaData->houseAreas = (object)$areaData->houseAreas;
        }
        if (isset($areaData->dualOccArea)) {
            $dualOccupancy = true;
            $areaData->dualOccArea = (array)$areaData->dualOccArea;
            for ($i = 0; $i < count($areaData->dualOccArea); ++$i) {
                $areaData->dualOccArea[$i] = (object)$areaData->dualOccArea[$i];
            }
        }

        $rotation = request()->rotation ?? 0;
        $northRotation = request()->northRotation ?? 0;

        $sitingImage = Arr::get(request(), 'sitingImage', '');
        $engineeringImage = Arr::get(request(), 'engineeringImage', '');
        $nearmapImage = Arr::get(request(), 'nearmapImage', '');

        try {
            // Save the SVG render of the siting
            $tempFileName = Str::random(40);
            $filePath = File::generateOSTempfilename('.svg');
            file_put_contents($filePath, urldecode(base64_decode($sitingImage)));
            File::storeToTempFolderFromPath($filePath, $tempFileName . ".svg");
            $thumb = File::moveTemporaryFileToStorage($tempFileName . ".svg", Siting::$storageFolder);
            $siting->fill(compact('thumb'));

            // Print the siting brochure
            $pdf = Siting::printBrochure(
                $siting,
                $siting->user ? $siting->user->company : null,
                $areaData,
                $rotation,
                $northRotation,
                $dualOccupancy
            );

            if ($pdf) {
                File::storeToTempFolderFromPath($pdf, $tempFileName . '.pdf');
                $path = File::moveTemporaryFileToStorage($tempFileName . '.pdf', Siting::$storageFolder);
            }

            // Save the HTML render of the engineering overlay, if present
            if ($pdf && $engineeringImage) {
                $filePath = File::generateOSTempfilename('.html');
                file_put_contents($filePath, urldecode(base64_decode($engineeringImage)));
                File::storeToTempFolderFromPath($filePath, $tempFileName . ".html");
                $engineering = File::moveTemporaryFileToStorage($tempFileName . ".html", Siting::$storageFolder);
                $siting->fill(compact('engineering'));
                unlink($filePath);

                $engineeringPDF = Siting::printEngineering($siting);
            }

            // See if we have a new nearmap upload
            if ($pdf && $nearmapImage) {
                $filePath = File::generateOSTempfilename('.html');
                file_put_contents($filePath, urldecode(base64_decode($nearmapImage)));
                File::storeToTempFolderFromPath($filePath, $tempFileName . ".nearmap.html");
                $nearmap = File::moveTemporaryFileToStorage($tempFileName . ".nearmap.html", Siting::$storageFolder);
                $siting->fill(compact('nearmap'));
                unlink($filePath);
            }

            // if we have a nearmap upload available, use it
            if ($pdf && $siting->nearmap) {
                $nearmapPDF = Siting::printNearmap($siting);
            }

            if (isset($engineeringPDF) || isset($nearmapPDF)) {
                // Merge the Engineering / Nearmap overlay into the Siting PDF
                $merger = new Merger;

                // create two temp files
                $merger->addFile($pdf);
                if (isset($engineeringPDF)) {
                    $merger->addFile($engineeringPDF, new Pages('1'));
                }
                if (isset($nearmapPDF)) {
                    $merger->addFile($nearmapPDF, new Pages('1'));
                }
                $createdPdf = $merger->merge();

                // Merge PDF and overwrite
                $mergePath = File::generateOSTempfilename('.pdf');
                file_put_contents($mergePath, $createdPdf);
                File::storeToTempFolderFromPath($mergePath, $tempFileName . '.pdf');
                $mergePDF = File::moveTemporaryFileToStorage($tempFileName . '.pdf', Siting::$storageFolder);
                unlink($mergePath);
            }

            if ($pdf) {
                $file_name = substr(
                        Str::slug(($siting->first_name ?? 'Noname') . '-' . ($siting->last_name ?? 'Noname') . '-' . ($siting->house ?? 'House')),
                        0, 250
                    ) . '.pdf';
                $siting->update(compact('path', 'file_name', 'thumb'));
            }
        } catch (\Exception $e) {
            throw $e;
        }
    }

    /**
     * @param Request $request
     * @param Siting $siting
     */
    public function resiteLot(Request $request, Siting $siting)
    {
        $resiteSiting = $siting->cloneSiting($siting, true);
        $this->update($request, $resiteSiting);
        $resiteSiting->append('resiteUrl');

        return compact('resiteSiting');
    }

    function exportPdf(Siting $siting)
    {
        return File::appStorage()->download($siting->path, $siting->file_name);
    }

    function getAvailableClients(Siting $siting)
    {
        /** @var Builder $user */
        $user = auth()->user();
        $clients = $user->getClientsForInvite($siting);

        return compact('clients');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param Siting $siting
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Exception
     */
    public function destroy(Siting $siting)
    {
        $this->authorize('update', $siting);
        $siting->delete();

        $sitings = Siting::getFilteredCollection(request()->only(['order', 'sort_by', 'filter']));
        return compact('sitings');
    }

    /**
     * @param Siting $siting
     * @param Boolean $addSitingSession
     * @return array
     */
    public function getPlan(Siting $siting, $addSitingSession = false)
    {
        $drawerData = $siting->getDrawerData();
        $drawerData->referencePlan = $siting->getReferencePlan();
        $drawerData->engineeringPlan = $siting->getEngineeringPlan();

        $drawerData->load(['page', 'engineeringPage']);
        $drawerData->setHidden(['page_id', 'page_id_engineering']);

        if ($addSitingSession) {
            $drawerData->append('sitingSession');
        }

        $appends = ['templateImage', 'xmlURL', 'themeURL', 'userActions', 'houseURL', 'userSettings'];
        $sitingColumns = array_merge(['id'], $appends);

        $siting->append($appends);
        $siting->setVisible($sitingColumns);

        return compact('siting',  'drawerData');
    }
}
