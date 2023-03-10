<?php

namespace App\Http\Controllers;

use App\Http\Requests\EstatePackageRequest;
use App\Http\Requests\FormulaValuesRequest;
use App\Models\Estate;
use App\Models\KaspaFormula;
use App\Models\Stage;
use App\Models\StageDoc;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\View\Factory;
use Illuminate\Http\Request;
use Illuminate\View\View;

class KaspaEngineController extends Controller
{
    /**
     * @param Request $request
     * @return array|Application|Factory|View
     */
    public function index(Request $request)
    {
        if (!$request->expectsJson()) {
            return view('user.spa', ['rootID' => 'kaspa-engine']);
        }
        $stage = Stage::findOrFail($request->id);
        $addedRules = $stage->formulaValue()->with('formula')->get();
        $doc = $stage->stageDocs()->where('type', StageDoc::types['mcp'])->first();
        if ($doc) {
            $doc->append('fileURL');
        }

        return compact('addedRules', 'doc');
    }

    /**
     * List estates
     *
     * @param Request $request
     * @return array
     * @throws Exception
     */
    public function filterEstates(Request $request): array
    {
        $estates = $this->getEstatesByName($request->estate);

        return compact('estates');
    }

    /**
     * List of formulas
     *
     * @param Request $request
     * @return array
     * @throws Exception
     */
    public function filterFormulas(Request $request): array
    {
        $formulas = KaspaFormula::where('description', 'like', '%' . ($request->formula ?? '') . '%')->get();
        return compact('formulas');
    }

    /**
     * List of region profiles for the current company & state
     *
     * @param Request $request
     * @return array
     * @throws Exception
     */
    public function filterProfiles(Request $request): array
    {
        $user = auth()->user();
        $profiles = $user->company->siteProfile
            ->where('state_id', '=', $user->state_id)
            ->toArray();

        return compact('profiles');
    }

    /**
     * List of formulas
     *
     * @param FormulaValuesRequest $request
     * @return array
     * @throws AuthorizationException
     */
    public function store(FormulaValuesRequest $request): array
    {
        $stage = Stage::findOrFail($request->id);

        $this->authorize('createFormula', $stage);

        foreach ($request->selectedFormulas as $v) {
            if (empty($v['id'])) {
                $stage->formulaValue()->create(['formula_id' => $v['formula']['id'], 'values' => $v['values']]);
            }
        }
        $addedRules = $stage->formulaValue()->with('formula')->get();
        $message = 'Formulas has been saved';

        return compact('addedRules', 'message');
    }

    /**
     * @param FormulaValuesRequest $request
     * @return array
     * @throws AuthorizationException
     */
    public function destroy(FormulaValuesRequest $request): array
    {
        $stage = Stage::findOrFail($request->id);

        $this->authorize('destroyFormula', $stage);

        $stage->formulaValue()->where('id', '=', $request->formula_id)->delete();
        $addedRules = $stage->formulaValue()->with('formula')->get();
        $message = 'Formula has been removed';

        return compact('addedRules', 'message');
    }

    /**
     * @param EstatePackageRequest $request
     * @return array
     * @throws AuthorizationException
     */
    public function storeStagePdf(EstatePackageRequest $request)
    {
        $stage = Stage::findOrFail($request->stage_id);
        $type = $request->get('type');
        $this->authorize('updateEstateDocuments', $stage->estate);
        StageDoc::storeByStage($stage, $request->file, $type);
        $estates = $this->getEstatesByName();
        $message = 'The document has been uploaded';

        return compact('estates', 'message');
    }

    /**
     * @param Request $request
     * @return array
     * @throws AuthorizationException
     */
    public function destroyStagePdf(Request $request)
    {
        $doc = StageDoc::findOrFail($request->id);
        $estate = $doc->stage->estate;
        $this->authorize('updateEstateDocuments', $estate);
        $doc->delete();
        $estates = $this->getEstatesByName();
        $message = 'The document has been deleted';

        return compact('estates', 'message');
    }

    /**
     * @param $name
     * @return mixed
     */
    protected function getEstatesByName($name = '')
    {
        return Estate::byNameLike($name)->with(['stage', 'stage.stageDocs'])->get();
    }
}

