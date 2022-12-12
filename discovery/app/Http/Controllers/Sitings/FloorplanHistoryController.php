<?php

namespace App\Http\Controllers\Sitings;

use App\Http\Controllers\Controller;
use App\Models\Sitings\Floorplan;
use App\Models\Sitings\FloorplanFiles;
use Illuminate\Http\Request;

class FloorplanHistoryController extends Controller
{

    /**
     * @param Request $request
     * @param Floorplan $floorplan
     * @return array
     * @throws \Exception
     */
    function show(Request $request, Floorplan $floorplan)
    {
        $this->authorize('view', $floorplan);
        $floorplanHistory       = $floorplan->floorplanHistory()->get();
        $floorplanHistoryStatus = $floorplan->history;

        return compact('floorplanHistory', 'floorplanHistoryStatus');
    }

    /**
     * @param Request $request
     * @param Floorplan $floorplan
     * @return array
     * @throws \Exception
     */
    function update(Request $request, Floorplan $floorplan)
    {
        $this->authorize('acknowledgeNotes', $floorplan);

        $floorplan->floorplanHistory()->update(['viewed' => 1]);
        $floorplan->updateHistoryStatus();

        if ($request->has('is_single')) {


            $floorplan->files->each(function (FloorplanFiles $f) {
                $f->append('fileUrl');
            });

            $floorplan->load('range', 'files', 'floorplanHistory');

            $result['floorplanData']           = $floorplan->toArray();
            $result['floorplanData']['zipUrl'] = route(
                'download.floorplan-zip',
                ['floorplan' => $floorplan->getKey()],
                false
            );

            return $result;
        } else {
            return [
                'floorPlans' => Floorplan::listFloorplans($request->only(['order', 'sort_by']))
            ];
        }
    }
}
