<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;


class ErrorHandlerController extends Controller
{
    /**
     * @param Request $request
     * @throws \Exception
     * @return array
     */
    function catchError(Request $request)
    {
        if ($request->ajax()) {
            if ($request->has('exception')) {
                $exception = $request->get('exception');

                \ExceptionHelper::processFrontendException($exception);

                return;
            }
        }

        return back()->withErrors(['Unauthorized action.']);
    }
}
