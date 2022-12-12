<?php

namespace App\Http\Controllers\Lotmix;

use App\Http\Controllers\EstatePackageController as LsEstatePackageController;
use App\Http\Requests\{
    EstatePackageRequest
};
use App\Models\{
    Estate, File, StageDoc
};
use Symfony\Component\HttpFoundation\StreamedResponse;

//TODO: deprecated
class EstatePackageController extends LsEstatePackageController
{
    /**
     * @param EstatePackageRequest $request
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function index(EstatePackageRequest $request)
    {
        $estate = Estate::findOrFail($request->estateId);
        //TODO fix me
//        $this->authorize('view', $estate);
        return $this->listEstatePackages($estate);
    }

    /**
     * @param Estate $estate
     * @param null $resultMessage
     * @return array
     */
    protected function listEstatePackages(Estate $estate, $resultMessage = null)
    {
        $stages = $estate->stage();
        $stages->published();

        $response = [
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
        //TODO fix me
//        $this->authorize('view', $stageDoc->stage->estate);

        if ($stageDoc->type == StageDoc::types['other']) {
            return File::getStreamedResponse($stageDoc->path, $stageDoc->name);
        }

        config(['title' => "{$stageDoc->stage->estate->name} stage {$stageDoc->stage->name} $stageDoc->name"]);
        $stageDoc->append('fileURL');
        return view('layouts.pdf-viewer', $stageDoc->toArray());
    }
}
