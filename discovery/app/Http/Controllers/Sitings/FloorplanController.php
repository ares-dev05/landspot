<?php

namespace App\Http\Controllers\Sitings;

use App\Http\Controllers\Controller;
use App\Models\{
    File, Company, State, Range
};
use App\Http\Requests\Sitings\{StoreFloorplanRequest, UploadDocumentFileRequest};
use App\Jobs\Sitings\{SendNewFloorplanFilesNotificationJob, SendNewFloorplanNotificationJob};
use App\Models\Sitings\{Floorplan, FloorplanFiles, FloorplanIssues, User};
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\{Request, UploadedFile};
use Illuminate\Support\Arr;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class FloorplanController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @param Request $r
     * @return array|\Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    function index(Request $r)
    {
        if ($r->expectsJson()) {
            /** @var User $user */
            $user = auth()->user();

            if ($user->can('contractor')) {
                $ranges    = new Range();
                $companies = Company::all();
            } else {
                $ranges    = $user->company->ranges();
                $companies = collect([$user->company_id => $user->company]);
            }

            $ranges    = $ranges->get(['id', 'name', 'state_id'])->keyBy('id');
            $states    = State::all(['id', 'abbrev'])->keyBy('id');
            $companies = $companies->keyBy('id');

            $floorPlans = $this->listFloorplans($r);

            return compact('floorPlans', 'ranges', 'companies', 'states');
        }

        return view('sitings.app.index');
    }
    /**
     *
     * @param Request $request
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    protected function listFloorplans(Request $request)
    {
        return Floorplan::listFloorplans($request->only(['order', 'sort_by']));
    }

    /**
     *
     * @param Request $request
     * @param Floorplan $floorplan
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    function listFiles(Request $request, Floorplan $floorplan)
    {
        $this->authorize('view', $floorplan);
        $dwgFiles = $floorplan->files()->get(['id', 'name', 'created_at', 'path']);
        $dwgFiles->each(function (FloorplanFiles $f) {
            $f->append('fileUrl');
        });

        $zipURL = route('download.floorplan-zip', ['floorplan' => $floorplan->getKey()], false);

        return compact('dwgFiles', 'zipURL');
    }

    /**
     * @param UploadDocumentFileRequest $request
     * @return array
     * @throws \Exception
     */
    function uploadFile(UploadDocumentFileRequest $request)
    {
        if (!$request->allFiles()) {
            throw new BadRequestHttpException('Files required');
        }

        if ($request->has('floorplanId')) {
            /** @var Floorplan $floorplan */
            $floorplan = Floorplan::findOrFail($request->get('floorplanId'));
            $this->authorize('view', $floorplan);

            if (app()->environment('production')) {
                File::setDisk('s3-footprints');
            }
            File::setStorageDirectory('');
            $fileData = File::moveUploadedFileToStorage($request->file('files'), $floorplan->getStoragePath(), true);

            try {
                switch ($request->file_type) {
//                    case 'DWG':
//                        $filePath = $documentType . '_dwg_path';
//                        $fileName = $documentType . '_dwg_file_name';
//                        break;

                    case 'SVG':
                        $this->authorize('contractor');
                        $floorplan->update([
                            'url' => $fileData['name'],
                            'area_data' => null,
                        ]);
                        break;

                    default:
                        throw new BadRequestHttpException('Invalid document type');
                }

                return ['message' => 'File was successfully uploaded'];
            } catch (\Exception $e) {
                File::deleteFile($fileData['storagePath']);
            }
        } else {
            $uploadedFiles = $request->allFiles();
            $files         = [];
            foreach ($uploadedFiles as $fileNames) {
                if ($fileNames instanceof UploadedFile) {
                    $files[] = array_intersect_key(
                        File::storeToTempFolder($fileNames),
                        array_flip(['fileName', 'name'])
                    );
                } else {
                    foreach ($fileNames as $file) {
                        $files[] = array_intersect_key(
                            File::storeToTempFolder($file),
                            array_flip(['fileName', 'name'])
                        );
                    }
                }
            }

            if ($files) {
                return count($files) == 1 ? $files[0] : $files;
            } else {
                throw new BadRequestHttpException('Files required');
            }
        }
    }

    function store(StoreFloorplanRequest $r)
    {
        $this->authorize('create-floorplans');
        /** @var User $user */
        $user      = auth()->user();
        $rangeName = $r->get('range');
        $company   = $user->company;

        /** @var Range $range */
        $range = null;

        if ($rangeName) {
            $rangeName = (mb_stripos($rangeName, ' Range') === false) ? ucwords(trim($rangeName) . ' Range') : $rangeName;
            $range = $company->ranges()->byName($rangeName)->first();
            if (!$range) {
                $range = $company->ranges()->create([
                    'state_id' => $r->get('state_id'),
                    'name'     => $rangeName,
                ]);
            }
        }

        if (!$range) {
            throw new BadRequestHttpException('Invalid range');
        }

        $liveDate        = $r->get('live_date');
        $floorplans      = $r->get('floorplans');
        $newFloorplanIds = [];

        foreach ($floorplans as $floorplanData) {
            /** @var Floorplan $floorplan */
            $floorplan       = $range->floorplans()->create([
                'company_id' => $company->getKey(),
                'name'       => Arr::get($floorplanData, 'name'),
                'live_date'  => $liveDate
            ]);
            $dwgName         = Arr::get($floorplanData, 'file_dwg.fileName');
            $dwgTempFilename = Arr::get($floorplanData, 'file_dwg.name');

            $dwgPath = null;

            $fileNames = [];

            try {
                $dwgPath = File::moveTemporaryFileToStorage($dwgTempFilename, FloorplanFiles::storageFolder);
                /** @var FloorplanFiles $fileDWG */
                $floorplan->files()->create([
                    'created_at' => time(),
                    'name'       => $dwgName,
                    'path'       => $dwgPath,
                ]);
                $fileNames[]       = $dwgName;
                $newFloorplanIds[] = $floorplan->getKey();
            } catch (\Exception $e) {
                logger()->error($e->getMessage());
                File::deleteFile($dwgPath);

                return ['errors' => ['Error upon saving floorplan: ' . $e->getMessage()]];
            }

            if ($fileNames) {
                $floorplan->insertNote('New floorplan uploaded (' . implode(', ', $fileNames) . ')', 1);
            }
        }

        if ($newFloorplanIds) {
            dispatch(new SendNewFloorplanNotificationJob($newFloorplanIds));
        }

        return [
            'ajaxSuccess' => count($floorplans) > 1 ? 'Floorplans have been added' : 'Floorplan has been added'
        ];
    }

    /**
     * @param Request $r
     * @param $floorplan
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    function show(Request $r, $floorplan)
    {
        $result = [
            'states' => State::all(),
            'ranges' => auth()->user()->company->ranges()->orderBy('name')->get()
        ];

        $floorplanID = (int)$floorplan;
        if ($floorplanID > 0) {
            /** @var Floorplan $floorplanObj */
            $floorplanObj = Floorplan::findOrFail($floorplanID);
            $this->authorize('view', $floorplanObj);
            $this->_prepareFloorplanResponse($floorplanObj);
            $floorplanObj->files->each(function (FloorplanFiles $f) {
                $f->append('fileUrl');
            });
            $result['floorplanData']           = $floorplanObj->toArray();
            $result['floorplanData']['zipUrl'] = route(
                'download.floorplan-zip',
                ['floorplan' => $floorplanObj->getKey()],
                false
            );
        }

        return $result;
    }

    /**
     * @param Request $r
     * @param $floorplan
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    function destroy(Request $r, Floorplan $floorplan)
    {
        $this->authorize('sitings-global-admin');

        $floorplan->delete();
        $floorPlans = $this->listFloorplans($r);

        return compact('floorPlans');
    }

    function update(Request $r, Floorplan $floorplan)
    {
        /** @var User $user */
        $user = auth()->user();
        $this->authorize('update', $floorplan);

        $fields = [
            User::PORTAL_ACCESS_BUILDER    => ['file_dwg', 'update_note'],
            User::PORTAL_ACCESS_CONTRACTOR => ['review_status', 'issue_text'],
            User::PORTAL_ACCESS_ADMIN      => [],
        ];

        $attributes = $fields[$user->has_portal_access] ? $r->only($fields[$user->has_portal_access]) : $r->all();

        $fileDWGs = $attributes['file_dwg'] ?? [];
        $note     = $attributes['update_note'] ?? '';

        if ($fileDWGs) {
            $this->authorize('uploadFiles', $floorplan);
            if ($note == '') {
                throw new BadRequestHttpException('Note required');
            }

            $fileNames = [];

            foreach ($fileDWGs as $fileData) {
                /** @var Floorplan $floorplan */

                $dwgName         = Arr::get($fileData, 'fileName');
                $dwgTempFilename = Arr::get($fileData, 'name');

                $dwgPath = null;

                try {
                    $dwgPath = File::moveTemporaryFileToStorage($dwgTempFilename, FloorplanFiles::storageFolder);

                    $floorplan->files()->create([
                        'created_at' => time(),
                        'name'       => $dwgName,
                        'path'       => $dwgPath,
                        'note'       => $note
                    ]);
                    $fileNames[] = $dwgName;
                } catch (\Exception $e) {
                    logger()->error($e->getMessage());
                    File::deleteFile($dwgPath);

                    return ['errors' => ['Error upon saving floorplan: ' . $e->getMessage()]];
                }

            }

            if ($fileNames) {
                /** @var User $user */
                $floorplan->insertNote('Update to floorplan uploaded: (' . implode(', ', $fileNames) . ')' . $note, 1);
            }

            dispatch(new SendNewFloorplanFilesNotificationJob($floorplan->getKey()));

            unset($attributes['file_dwg'], $attributes['update_note']);
        }

        if ($r->has('review_status', 'issue_text')) {
            $reviewStatus = $attributes['review_status'];
            if ($reviewStatus === '0' || $reviewStatus === '1') {
                if ($reviewStatus) {
                    $floorplan->insertNote('Floorplan has been successfuly reviewed.');
                    $attributes['status'] = Floorplan::STATUS_AWAITING_APPROVAL;
                } else {
                    $floorplan->issues()->create(['issue_text' => $attributes['issue_text']]);
                    $attributes['status'] = Floorplan::STATUS_ATTENTION;
                }
            }
        }

        if ($r->has('issues_status')) {
            $issuesStatus = $attributes['issues_status'];
            $floorplan->updateIssuesStatus(
                $issuesStatus
                    ? FloorplanIssues::STATUS_ACCEPTED
                    : FloorplanIssues::STATUS_REJECTED
            );
        }

        //TODO: live_date is incorrect sometimes
        $floorplan->update($attributes);

        if ($r->get('single')) {
            $this->_prepareFloorplanResponse($floorplan);

            return ['floorplanData' => $floorplan];
        }

        $floorPlans  = $this->listFloorplans($r);
        $ajaxSuccess = 'Floorplan has been updated';

        return compact('floorPlans', 'ajaxSuccess');
    }

    protected function _prepareFloorplanResponse(Floorplan $floorplan)
    {
        /** @var User $user */
        $user = auth()->user();
        $floorplan->load('range', 'files', 'floorplanHistory');

        if ($user->can('contractor')) {
            $floorplan->append('hasUnreviewedIssues');
        }

        if ($user->can('sitings-global-admin')) {
            $floorplan->load(['issues' => function (HasMany $b) {
                $b->unreviewedIssues();
            }]);
        }
    }
}
