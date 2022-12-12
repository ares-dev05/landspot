<?php

namespace Landconnect\Blog\Http\Controllers;

use App\Http\Controllers\Controller;

class BlogController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector|array
     */
    public function getUser()
    {
        if (!\request()->expectsJson()) {
            return redirect('/blog');
        }

        $user = [
            'isAdmin' => !!optional(auth()->user())->can('global-admin')
        ];

        return compact('user');
    }
}
