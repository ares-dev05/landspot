<?php

namespace Landconnect\Blog;

use Illuminate\Contracts\Routing\Registrar as Router;
use Landconnect\Blog\Http\Middleware\CheckAdmin;

class RouteRegistrar
{
    /**
     * The router implementation.
     *
     * @var \Illuminate\Contracts\Routing\Registrar
     */
    protected $router;

    /**
     * Create a new route registrar instance.
     *
     * @param  \Illuminate\Contracts\Routing\Registrar $router
     */
    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    /**
     * Register routes for transient tokens, clients, and personal access tokens.
     *
     * @return void
     */
    public function all()
    {
        app('router')->aliasMiddleware('check.admin' , CheckAdmin::class);
        $this->forPosts();
        $this->forAdmin();
        $this->forFiles();

        $this->forSubscription();
    }

    /**
     * Register the routes needed for document.
     *
     * @return void
     */
    public function forPosts()
    {
        $this->router->group(['prefix' => '/api',], function (\Illuminate\Routing\Router $router) {
            $router->resource('post', 'PostController',
                ['only' => ['index', 'show']]);
            $router->get('/get-user', 'BlogController@getUser');
        });


        $this->router->group([], function (\Illuminate\Routing\Router $router) {
            $router->get('/admin', 'Admin\PostController@index');
        });

        $options = [];
        if (Blog::$authOnly) {
            $options['middleware'] = ['auth.user'];
        }

        $this->router->group($options, function (\Illuminate\Routing\Router $router) {
            $router->get('/', 'PostController@index');
            $router->get('/{post}', 'PostController@index');
        });
    }

    /**
     * Register the routes needed for document.
     *
     * @return void
     */
    public function forSubscription()
    {
        $this->router->group(['prefix' => '/api',], function (\Illuminate\Routing\Router $router) {
            $router->post('/subscribe', 'SubscriptionController@subscribe');
        });
    }

    /**
     * Register the routes needed for document.
     *
     * @return void
     */
    public function forAdmin()
    {
        $namespace = version_compare(app()->version(), "5.8.*", "<")
            ? '\Admin'
            : '\Landconnect\Blog\Http\Controllers\Admin';
        $this->router->group([
            'prefix' => '/admin',
            'namespace' => $namespace,
            'middleware' => 'check.admin'
        ], function (\Illuminate\Routing\Router $router) {
            $router->resource('posts', 'PostController',
                ['only' => ['index', 'edit', 'create', 'store', 'update', 'destroy']]
            );
            $router->resource('topics', 'TopicController');
            $router->get('/', 'PostController@index');
        });
        $this->router->group([
            'prefix' => '/admin',
            'namespace' => $namespace,
        ], function (\Illuminate\Routing\Router $router) {
            $router->get('/login', 'Auth\LoginController@showLoginForm')->name('insights.login-form');
            $router->post('/login', 'Auth\LoginController@login')->name('insights.login');
        });
    }

    /**
     * Register the routes needed for file.
     *
     * @return void
     */
    public function forFiles()
    {
        $namespace = version_compare(app()->version(), "5.8.*", "<")
            ? '\Admin'
            : '\Landconnect\Blog\Http\Controllers\Admin';
        $this->router->group([
            'prefix' => '/admin',
            'namespace' => $namespace,
            'middleware' => 'check.admin'
        ], function (\Illuminate\Routing\Router $router) {
            $router->resource('media', 'MediaController',
                [
                    'only' => ['index', 'show', 'create', 'store', 'destroy'],
                    'parameters' => ['media' => 'media']
                ]
            );
            $router->post('upload-blog-media', 'MediaController@uploadFile');
            $router->delete('posts_thumb/{post}', 'MediaController@deleteThumb')->name('posts_thumb.destroy');
        });
    }
}
