<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class RepositoriesServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        app()->bind('estate_repository', 'App\Repositories\Estate\EstateRepository');
        app()->bind('house_repository', 'App\Repositories\House\HouseRepository');
        app()->bind('company_repository', 'App\Repositories\Company\CompanyRepository');
    }
}
