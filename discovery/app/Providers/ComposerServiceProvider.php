<?php

namespace App\Providers;

use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class ComposerServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
        View::composer('*', function () {
            $viewsPath = config('view.compiled');
            if (!is_dir($viewsPath)) {
                $mask = umask(0);
                mkdir($viewsPath, 0755, true);
                umask($mask);
            }
        });

        // Using Closure based composers...
        View::composer(['landspot.tos', 'landspot.privacy-policy', 'landspot.homepage'], function ($view) {
            \UserGuardHelper::checkAuthGuards();
        });
    }

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
