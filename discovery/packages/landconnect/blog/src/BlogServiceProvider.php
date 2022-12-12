<?php

namespace Landconnect\Blog;

use Illuminate\Support\ServiceProvider;
use Landconnect\Blog\Console\Commands\MigrateBlogCommand;
use Landconnect\Blog\Console\Commands\RollbackBlogCommand;

class BlogServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'blog');

        if ($this->app->runningInConsole()) {
//            $this->registerMigrations();

            $this->publishes([
                __DIR__ . '/../resources/views' => base_path('resources/views'),
            ], 'blog-views');

            $this->publishes([
                __DIR__ . '/../resources/assets/js' => base_path('resources/assets/js/blog'),
            ], 'blog-components');

            $this->publishes([
                __DIR__.'/../config/subscription.php' => config_path('subscription.php'),
            ]);
        }

        if ($this->app->runningInConsole()) {
            $this->commands([
                MigrateBlogCommand::class,
                RollbackBlogCommand::class,
            ]);
        }

        // Using Closure based composers...
        view()->composer(['blog::insights.index'], function ($view) {
            $authGuards = array_keys(config('auth.guards'));
            foreach ($authGuards as $guard) {
                if (auth()->guard($guard)->check()) auth()->shouldUse($guard);
            }
        });

    }

    /**
     * Register Passport's migration files.
     *
     * @return void
     */
    protected function registerMigrations()
    {
        if (Blog::$runsMigrations) {
            $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');
        }

        $this->publishes([
            __DIR__ . '/../database/migrations' => database_path('migrations'),
        ], 'blog-migrations');
    }

    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        $this->mergeConfigFrom(__DIR__.'/../config/subscription.php', 'subscription');
    }
}
