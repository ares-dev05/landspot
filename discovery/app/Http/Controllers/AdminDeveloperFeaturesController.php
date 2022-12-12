<?php

namespace App\Http\Controllers;

use App\Models\{Company, Estate, EstatePremiumFeatures};
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class AdminDeveloperFeaturesController extends Controller
{
    /**
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    function index(Request $request)
    {
        if ($request->expectsJson()) {
            if ($request->has('companyID')) {
                /** @var Company $company */
                $company = Company::developerCompany()->findOrFail($request->get('companyID'));
                $estates = $company
                    ->estate()
                    ->approved()
                    ->orderBy('name')
                    ->get(['id', 'name', 'published', 'small', 'thumb', 'path']);

                return compact('estates');
            }

            if ($request->has('estateID')) {
                /** @var Estate $estate */
                $estate = Estate::approved()->findOrFail($request->get('estateID'));

                return $this->_listFeatures($estate);
            }

            $companies = Company::developerCompany()
                ->orderBy('name')
                ->get();

            return compact('companies');

        }

        return view('admin.developer-features');
    }


    protected function _listFeatures(Estate $estate)
    {
        $features = $estate->premiumFeatures()->get(['type'])->pluck('type')->all();

        $availableFeatures = array_values(array_diff(EstatePremiumFeatures::features, $features));

        return compact('features', 'availableFeatures');
    }

    /**
     * @param Request $request
     * @return array
     * @throws \Illuminate\Validation\ValidationException
     */
    function update(Request $request)
    {
        /** @var Estate $estate */
        $estate = Estate::approved()->findOrFail($request->get('estateID'));
        $state  = $request->get('state');
        if ($request->route()->hasParameters()) {
            $feature = current($request->route()->parameters());
            if (!in_array($feature, EstatePremiumFeatures::features)) {
                throw new BadRequestHttpException();
            }
            if ($state) {
                $estate->premiumFeatures()->firstOrCreate(['type' => $feature]);
            } else {
                $estate->premiumFeatures()->byType($feature)->delete();
            }
        }

        return $this->_listFeatures($estate);
    }
}
