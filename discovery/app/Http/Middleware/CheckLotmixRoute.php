<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckLotmixRoute
{
    const COMPANY = 'company';
    const ESTATE = 'estate';

    const MODELS = [
        'company',
        'estate'
    ];

    private $modelsNamespace = '\\App\\Models\\';
    private $lotmixModelsNamespace = '\\App\\Models\\Lotmix\\';

    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     * @param $model // company, estate
     * @return mixed
     */
    public function handle($request, Closure $next, $model)
    {
        if (!in_array(strtolower($model), self::MODELS)) {
            return $next($request);
        }

        if (!$slug = $request->route('slug')) {
            return $next($request);
        }

        if(self::COMPANY === $model){
            $company = app($this->lotmixModelsNamespace . ucfirst($model))::whereSlug($slug)->first();
            if(!$company || !app($this->modelsNamespace . ucfirst($model))::byId($company->id)->scopes(['hasBriefAdmin', 'hasDiscovery', 'hasEstatesAccess'])->exists()){
                abort(404);
            }
        }

        if(self::ESTATE === $model){
            if (!app($this->modelsNamespace . ucfirst($model))::getEstatesLotCount(['lotmix' => 1, 'published' => 1])[0]->contains('slug', $slug)) {
                abort(404);
            }
        }

        return $next($request);
    }
}
