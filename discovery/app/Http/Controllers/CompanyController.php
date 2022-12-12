<?php

namespace App\Http\Controllers;

use App\Http\Requests\CompanyRequest;
use App\Models\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    function show($company)
    {
        $company = Company::findOrFail($company);

        return compact('company');
    }

    function store(CompanyRequest $request)
    {
        return Company::create($request->all());
    }

    function update(Company $company, Request $request)
    {
        $company->update($request->only(['chas_discovery', 'chas_estates_access']));

        return $company;
    }
}
