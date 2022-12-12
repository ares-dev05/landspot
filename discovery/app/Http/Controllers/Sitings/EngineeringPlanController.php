<?php

namespace App\Http\Controllers\Sitings;

use App\Models\File;
use App\Models\ImageFromPDF;
use App\Models\Sitings\EngineeringPlan;
use App\Models\Sitings\Siting;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Arr;

class EngineeringPlanController extends Controller
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
        $engineeringPlan = $siting->engineeringPlan()->firstOrNew([]);
        $tempFilename  = Arr::get($file, 'name');
        if ($tempFilename == '') throw  new \Exception('Invalid name');

        $data['name']       = Arr::get($file, 'fileName', 'Noname');
        $data['path']       = File::moveTemporaryFileToStorage($tempFilename . '.pdf', EngineeringPlan::$storageFolder);
        $data['created_at'] = time();

        $engineeringPlan->fill($data)->save();

        $firstPage = $engineeringPlan->pages()->firstOrFail();

        $siting->drawerData->update(['page_id_engineering' => $firstPage->id]);

        return "Saved";
    }


    /**
     * @param EngineeringPlan $engineeringPlan
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View|StreamedResponse
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    function show(EngineeringPlan $engineeringPlan)
    {
        $this->authorize('view', $engineeringPlan->siting);

        config(['title' => "{$engineeringPlan->name}"]);
        $engineeringPlan->append('fileURL');
        return view('sitings.layouts.pdf-viewer', $engineeringPlan->toArray());
    }
}
