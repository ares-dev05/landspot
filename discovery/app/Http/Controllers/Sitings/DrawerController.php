<?php

namespace App\Http\Controllers\Sitings;

use App\Http\Controllers\Controller;

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
}
