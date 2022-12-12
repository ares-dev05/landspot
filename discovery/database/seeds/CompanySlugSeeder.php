<?php

use App\Models\Lotmix\Company;
use Illuminate\Database\Seeder;

class CompanySlugSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $companies = Company::all();

        $companies->each(function (Company $company) {
            $company->generateSlug();
            $company->save();
        });
    }
}
