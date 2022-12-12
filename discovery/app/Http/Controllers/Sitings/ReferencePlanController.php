<?php

namespace App\Http\Controllers\Sitings;

use App\Http\Controllers\Controller;
use App\Models\File;
use App\Models\ImageFromPDF;
use App\Models\Sitings\{
    ReferencePlan, Siting
};
use Illuminate\Http\Request;
use Illuminate\Support\{Arr};

class ReferencePlanController extends Controller
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
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return bool
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Exception
     */
    public function store(Request $request)
    {
        $data = $this->validate($request, [
            'image' => 'required|mimes:pdf|max:100000',
            'id'    => 'required|integer'
        ]);

        $siting = Siting::find($data['id']);

        $this->authorize('update', $siting);

        $file          = ImageFromPDF::storeToTempFolder($data['image']);
        $referencePlan = $siting->referencePlan()->firstOrNew([]);
        $tempFilename  = Arr::get($file, 'name');
        if ($tempFilename == '') throw  new \Exception('Invalid name');

        $data['name']       = Arr::get($file, 'fileName', 'Noname');
        $data['path']       = File::moveTemporaryFileToStorage($tempFilename . '.pdf', ReferencePlan::$storageFolder);
        $data['created_at'] = time();

        $referencePlan->fill($data)->save();

        $firstPage = $referencePlan->pages()->firstOrFail();

        $siting->drawerData->update(['page_id' => $firstPage->id]);

        return "Saved";
    }


    /**
     * @param ReferencePlan $referencePlan
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View|StreamedResponse
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    function show(ReferencePlan $referencePlan)
    {
        $this->authorize('view', $referencePlan->siting);

        config(['title' => "{$referencePlan->name}"]);
        $referencePlan->append('fileURL');
        return view('sitings.layouts.pdf-viewer', $referencePlan->toArray());
    }

}
