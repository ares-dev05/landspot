<?php

namespace App\Http\Controllers;

use App\Models\Facade;
use App\Models\House;
use App\Models\PDFRender;
use App\Models\Range;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class DiscoveryController extends Controller
{
    public function filter(Request $request)
    {
        if (\request()->expectsJson()) {
            $filters = [];
            $vars    = ['titles', 'houses'];
            if ($request->has('get_filters')) {
                $filters = $this->getFilters();
                $vars[]  = 'filters';
            }
//            $this->validate($request, ['order_by' => 'string|nullable|in:title,baths,beds,cars']);
            $clauses = $request->only([
                'bathrooms', 'beds', 'depth', 'double', 'fit', 'house', 'min', 'max', 'range', 'single', 'width'
            ]);

            if (empty($clauses['range'])) {
                unset($clauses['range']);
            }

//            $sortBy = $request->get('order_by', 'title');
            $houses = House::getFilteredCollection(
                $clauses,
                ['*'],
                LengthAwarePaginator::resolveCurrentPage(),
                'title'
            );

            $houses->each(function (House $house) {
                $house->randomFacadeImage = true;
            });

            unset($clauses['house']);
            $availableHousesNames = House::getFilteredCollection($clauses, ['id', 'title']);
            $titles = $this->getHouseTitles($availableHousesNames);

            return compact($vars);
        }

        return redirect('discovery');
    }

    /**
     * @param \Illuminate\Database\Eloquent\Collection $houses
     * @return \Illuminate\Database\Eloquent\Collection
     */
    protected function getHouseTitles($houses)
    {
        $houseTitles = $houses->sortBy('title')->values();
        $houseTitles = $houseTitles->map(function ($item) {
            return ['id' => $item['id'], 'title' => $item['title']];
        });

        return $houseTitles;
    }

    /**
     * @return array
     */
    protected function getFilters()
    {
        $houses = House::getCollection();
        $houses = $houses
            ->where('discovery', 1)
            ->sortBy('id')
            ->values();

        $houseRanges = $houses->pluck('rid')->unique();

        $ranges = auth()->user()->getUserRanges();

        $filters['ranges']       = $ranges->filter(function (Range $item) use ($houseRanges) {
            if ($houseRanges->contains($item->id)) {
                $item->setVisible(['id', 'name']);
                return true;
            }
        })->values();
        $filters['price']['max'] = $houses->max('price');
        $filters['price']['min'] = $houses->min('price');
        $filters['beds'] = $houses
            ->unique('beds')
            ->sortBy('beds')
            ->pluck('beds')
            ->filter(function ($value) {
                return $value > 0;
            })
            ->values();

        $filters['bathrooms']    = $houses
            ->unique('bathrooms')
            ->sortBy('bathrooms')
            ->pluck('bathrooms')
            ->filter(function ($value) {
                return $value > 0;
            })
            ->values();

        return $filters;
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\House $house
     * @return \Illuminate\Http\Response
     * @throws \Exception
     */
    public function show($discoveryMode, House $house)
    {
        $this->authorize('view', $house);

        $this->getHouseOptions($house);

        if (\request()->expectsJson()) {
            return response(['house' => $house]);
        }

        return redirect('discovery');
    }

    protected function getHouseOptions(House $house)
    {
        /** @var User $user */
        $user = auth()->user();
        $house->load(
            'attributes',
            'facades',
            'floorplans',
            'gallery',
            'options',
            'volume',
            'range'
        );
        $house['checkOptions'] = false;
        $house['builderCompanyId'] = optional($house->range)->builderCompanyId;

        foreach ($house->options as $option) {
            if ($option->path) {
                $house['checkOptions'] = true;
                break;
            }
        }
        $house['overview3DUrl'] = optional($house->volume)->path;
        $house['canFindLots'] = $user->can('estates-access');
        $house['hidePrintBrochure'] = false;

        return $this;
    }

    /**
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Contracts\View\Factory|\Illuminate\View\View
     * @throws \Exception
     * @throws \Throwable
     */
    function printBrochure(Request $request)
    {
        $facade = Facade::findOrFail($request->id);

        $this->authorize('view', $facade->house);
        $viewName = 'pdf.floorplans.' . Str::slug($facade->house->range->builderCompany->name);

        if (!view()->exists($viewName)) $viewName = 'pdf.floorplans.general';

        $view = view($viewName,
            [
                'facade' => $facade
            ]
        );

        if ($request->exists('html')) {
            return $view;
        }

        $filenamePDF = PDFRender::html2pdf($view);

        return response()
            ->download($filenamePDF, ($facade->title ?? 'Noname') . '.pdf', [], $request->has('inline') ? 'inline' : 'attachment')
            ->deleteFileAfterSend(true);
    }
}
