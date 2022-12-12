<?php

namespace App\Http\Controllers\Sitings;

use App\Http\Controllers\Controller;
use App\Models\File;
use App\Models\Sitings\Floorplan;
use App\Models\Sitings\FloorplanFiles;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class FloorplanSVGController extends Controller
{
    /**
     * @param Request $r
     * @param Floorplan $floorplan
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    function show(Request $r, Floorplan $floorplan)
    {
        $this->authorize('view', $floorplan);

        $floorplan->load('company', 'range.state');
        $floorplan->append('svgURL');
        $floorplan->makeVisible(['url']);

        return compact('floorplan');
    }

    /**
     * @param Request $r
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Exception
     */
    function store(Request $r)
    {
        $this->validate($r, [
            'floorplanId' => 'required|integer',
            'svgBlob'     => 'required',
            'areaJSON'    => 'required|string|min:10'
        ]);

        /** @var Floorplan $floorplan */
        $floorplan = Floorplan::findOrFail($r->get('floorplanId'));

        $this->authorize('view', $floorplan);

        $svg = $r->file('svgBlob');

        if (!$svg) throw new BadRequestHttpException();

        if (app()->environment('production')) {
            File::setDisk('s3-footprints');
        }
        File::setStorageDirectory('');
        $data = File::moveUploadedFileToStorage($svg, $floorplan->getStoragePath(), true);
        try {
            $areaJson = $r->get('areaJSON');
            $floorplan->update([
                'url'  => $data['name'],
                'area_data' => $areaJson
            ]);
        } catch (\Exception $e) {
            File::deleteFile($data['storagePath']);
            throw $e;
        }
        $floorplan->load('company', 'range.state');
        $floorplan->append('svgURL');

        return compact('floorplan');
    }
}
