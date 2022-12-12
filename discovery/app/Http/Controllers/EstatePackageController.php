<?php

namespace App\Http\Controllers;

use App\Http\Requests\{
    EstatePackageRequest
};
use App\Models\{
    Estate, File, Stage, StageDoc
};
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EstatePackageController extends Controller
{
    /**
     * @param EstatePackageRequest $request
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function index(EstatePackageRequest $request)
    {
        $estate = Estate::findOrFail($request->estateId);
        $this->authorize('view', $estate);
        return $this->listEstatePackages($estate);
    }

    /**
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function store(EstatePackageRequest $request)
    {
        $stage = Stage::findOrFail($request->get('stage_id'));
        $type  = $request->get('type');
        $this->authorize('updateEstateDocuments', $stage->estate);
        StageDoc::storeByStage($stage, $request->file, $type);

        return $this->listEstatePackages($stage->estate);
    }

    /**
     * @param StageDoc $object
     * @return array
     * @throws \Exception
     */
    function destroy(StageDoc $object)
    {
        $estate = $object->stage->estate;
        $this->authorize('updateEstateDocuments', $estate);
        $object->delete();
        return $this->listEstatePackages($estate);
    }

    /**
     * @param Estate $estate
     * @param null $resultMessage
     * @return array
     */
    protected function listEstatePackages(Estate $estate, $resultMessage = null)
    {
        $user = auth()->user();
        $stages = $estate->stage();
        if ($user->company->isBuilder()) {
            $stages->published();
        }
        $companies = [];
        $showCompanies = false;

        if(!$user->company->isBuilder() || $user->isGlobalAdmin()) {
            $showCompanies = true;
            $companies = (clone $stages)->lotBuilderCompanies()->get()->toArray();
        }

        $response = [
            'showCompanies'    => $showCompanies,
            'builderCompanies' => $companies,
            'exportUrl'        => route('landspot.export-stage'),
            'stages'           => $stages
                ->with('stageDocs')
                ->orderBy('name')
                ->get(),
        ];

        if ($resultMessage) {
            $response['ajax_success'] = $resultMessage;
        }
        return $response;
    }

    /**
     * @param StageDoc $stageDoc
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View|StreamedResponse
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    function previewFile(StageDoc $stageDoc)
    {
        $this->authorize('view', $stageDoc->stage->estate);

        if ($stageDoc->type == StageDoc::types['other']) {
            return File::getStreamedResponse($stageDoc->path, $stageDoc->name);
        }

        config(['title' => "{$stageDoc->stage->estate->name} stage {$stageDoc->stage->name} $stageDoc->name"]);
        $stageDoc->append('fileURL');
        return view('layouts.pdf-viewer', $stageDoc->toArray());
    }
}
