<?php

namespace App\Http\Controllers;

use App\Http\Requests\{
    ExportLotsRequest, UploadParagraphImageRequest, PDFTemplateRequest
};
use App\Models\{
    Estate, ImageWithThumbnails, Lot, PDFRender, Stage, User
};

class LotPDFTemplateController extends Controller
{
    /**
     * @param Estate $estate
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function show(Estate $estate)
    {
        $this->authorize('update', $estate);
        return $this->sendResponse($estate, []);
    }

    /**
     * @param Estate $estate
     * @param $response
     * @return mixed
     */
    protected function sendResponse(Estate $estate, $response) {
        $result = $this->getTemplate($estate)->toArray();

        if (!is_object($result['template_data']) && !$result['template_data']) {
            $result['template_data'] = (object)[];
        }

        $response['template'] = $result;
        $response['fetch']    = true;

        return $response;
    }

    /**
     * @param PDFTemplateRequest $request
     * @param Estate $estate
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \Exception
     */
    public function update(PDFTemplateRequest $request, Estate $estate)
    {
        $this->authorize('update', $estate);

        $template = $this->getTemplate($estate);

        if ($request->has('new-headerImage')) {
            $value = $request->input('new-headerImage');

            $template->header_logo = $value == '' ? null : ImageWithThumbnails::moveTemporaryFileToStorage(
                $value,
                'lots-template'
            );
        }

        if ($request->has('new-footerImage')) {
            $value = $request->input('new-footerImage');

            $template->footer_logo = $value == '' ? null : ImageWithThumbnails::moveTemporaryFileToStorage(
                $value,
                'lots-template'
            );
        }

        $template->template_data = $request->template_data;
        $template->save();

        return $this->sendResponse($estate, ['ajax_success' => 'Changes are saved']);
    }

    /**
     * @param Estate $estate
     * @return mixed
     */
    protected function getTemplate(Estate $estate)
    {
        return $estate
            ->pdfLotsTemplate()
            ->firstOrCreate([], ['template_data' => (object)[]]);
    }

    /**
     * @param UploadParagraphImageRequest $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \Exception
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function uploadParagraphImage(UploadParagraphImageRequest $request)
    {
        $this->authorize('uploadParagraphImage', Estate::class);

        $file                    = $request->file('image');
        $imageModel              = new ImageWithThumbnails();
        $imageModel::$imagesSize = ['thumb' => 898]; //120dpi x 190mm
        if ($file) {
            return response()->json($imageModel::storeToTempFolder($file));
        }
    }

    /**
     * @param ExportLotsRequest $request
     * @return \Response|\Illuminate\View\View
     * @throws \Exception
     * @throws \Throwable
     */
    function exportLots(ExportLotsRequest $request)
    {
        $this->authorize('view', $request->estate);

        if($request->stage_id != '') {
            $stagesIds = explode(',', $request->stage_id);
            if ($stagesIds) {
                $allStageIds = $request->estate->stage->pluck('id');
                $stagesIds   = $allStageIds->intersect($stagesIds);
            }
        } else {
            $stagesIds = $request->estate->stage->pluck('id');
        }

        $builderCompanyId     = $request->export_id > 0 ? (int)$request->export_id : null;
        $exportVisibilityType = $request->export_id;

        /** @var User $user */
        $user       = auth()->user();
        $unsoldLots = $request->unsold_lots === 'on';
        $columns    = $request->estate->listColumnsByOrder();

        if($user->company->isBuilder() && !$user->isGlobalAdmin()) {
            $stagesIds = optional($request->estate->stage->filter(function ($stage) {
                return $stage->published == 1;
            }))->pluck('id');
            $unsoldLots = true;
            $exportVisibilityType = Lot::exportVisibility['visible_to_all_and_builder_company'];
            $builderCompanyId = $user->company->id;
        }

        $stages = Stage::getLotsForExport(
            $stagesIds,
            $unsoldLots,
            $exportVisibilityType,
            $builderCompanyId
        );

        $template = $this->getTemplate($request->estate);
        $view = view('pdf.export-stage-lots',
            compact('stages', 'template','columns')
        );

        if ($request->exists('html')) {
            return $view;
        }

        $filenamePDF = PDFRender::html2pdf($view);

        $filename = sprintf('%s - Price List - %s.pdf', $request->estate->name, date('d M Y'));

        return response()
            ->download($filenamePDF, $filename, [], $request->has('inline') ? 'inline' : 'attachment')
            ->deleteFileAfterSend(true);
    }
}
