<?php

namespace App\Providers;

use App\Extensions\{FileBinaryMimeTypeGuesser, MimeExtensionGuesser};
use App\Models\{Range, User};
use Illuminate\Support\{Facades\URL, Str, ServiceProvider};
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\File\MimeType\{ExtensionGuesser, MimeTypeGuesser};


class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        if (!app()->environment('local')) {
            URL::forceScheme('https');
        }
        $appName = Str::slug(config('app.name'));
        $viewsPath = sys_get_temp_dir() . "/${appName}/views";
        config(['view.compiled' => $viewsPath]);

        Validator::extend('unique_email', function (
            $attribute, $value, $parameters, \Illuminate\Validation\Validator $validator
        ) {
            /** @var User $user */
            $user = $parameters[0] ?? null;
            $id = $user instanceof User ? $user->id : $user;

            $validator->setCustomMessages(['unique_email' => 'Invalid email']);


            return !User::byEmail($value)
                ->withoutGlobalScope('activeUsers')
                ->where('id', '<>', $id)
                ->first();
        });

        Validator::extend('unique_phone', function (
            $attribute, $value, $parameters, \Illuminate\Validation\Validator $validator
        ) {
            /** @var User $user */
            $user = $parameters[0] ?? null;
            $id = $user instanceof User ? $user->id : $user;

            $validator->setCustomMessages(['unique_phone' => 'Invalid phone']);

            $userModel = User::byPhone($value)
                ->withoutGlobalScope('activeUsers');
            if ($id) {
                $userModel->where('id', '<>', $id);
            }

            return !$userModel->first();
        });

        Validator::extend('exists_in_user_range', function (
            $attribute, $value, $parameters, \Illuminate\Validation\Validator $validator
        ) {
            /** @var User $user */
            $user = auth()->user();
            $validator->setCustomMessages(['exists_in_user_range' => 'Invalid user range']);
            if ($user) {
                if ($user->isGlobalAdmin()) {
                    return !!Range::find($value);
                }
                return $user->getUserRanges()->pluck('id')->contains($value);
            }

            return false;
        });

        ExtensionGuesser::getInstance()->register(new MimeExtensionGuesser());
        //ubuntu 16 temp fix for SVG
        MimeTypeGuesser::getInstance()->register(new FileBinaryMimeTypeGuesser());

        if ($this->app->runningInConsole()) {
            $this->registerMigrations();
        }
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    protected function registerMigrations()
    {
        $this->loadMigrationsFrom(app()->databasePath('migrations_sitings'));
    }
}
