<?php

namespace Landconnect\Blog;

use Illuminate\Support\Facades\Route;
use Landconnect\Blog\Http\Middleware\CheckBlogAccess;

class Blog
{
    /**
     * Indicates if Blog migrations will be run.
     *
     * @var bool
     */
    public static $runsMigrations = true;

    /**
     * Indicates whether the blog will only work for authenticated users..
     *
     * @var bool
     */
    public static $authOnly = false;

    const DB_PREFIX = 'insights_db_';

    /**
     * Binds the Passport routes into the controller.
     *
     * @param  array $options
     * @return void
     */
    public static function routes(array $options = [])
    {
        app('router')->aliasMiddleware('check.blog.access', CheckBlogAccess::class);

        $defaultOptions = [
            'prefix'    => '/insights',
            'namespace' => '\Landconnect\Blog\Http\Controllers',
        ];

        $options = array_merge($defaultOptions, $options);
        $options['middleware'][] = 'check.blog.access';

        Route::group($options, function ($router) {
            (new RouteRegistrar($router))->all();
        });

        $blogOptions = [
            'prefix' => '/blog',
            'namespace' => '\Landconnect\Blog\Http\Controllers'
        ];

        Route::group(array_merge($blogOptions, $options), function ($router) {
            (new RouteRegistrar($router))->all();
        });
    }

    /**
     * Configure Blog to not register its migrations.
     *
     * @return static
     */
    public static function ignoreMigrations()
    {
        static::$runsMigrations = false;

        return new static;
    }

    /**
     * Configure Blog for authenticated users only.
     *
     * @return static
     */
    public static function authOnly()
    {
        static::$authOnly = true;

        return new static;
    }
}
