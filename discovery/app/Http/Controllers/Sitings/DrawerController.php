<?php

namespace App\Http\Controllers\Sitings;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Lot;
use Illuminate\Http\Request;

class DrawerController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        /** @var User $user */
        $user = auth()->user();

        return compact('user');
    }


    //TODO: Remove after review
    public function getBuilderLot(Request $request)
    {
        $company = Company::find($request->companyId ?? 1) ?? Company::first();
        $lot = Lot::whereHas('drawerData', function ($q) {
            return $q->whereNotNull('path');
        })->with('drawerData')->inRandomOrder()->first();
        $lot->drawerData->append('lot_image');
        $drawerTheme = $company->companyLotTheme;
        return response()->json(compact('lot', 'drawerTheme'));
    }
}
