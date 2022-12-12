<?php

use Faker\Generator as Faker;
use Illuminate\Support\{Str};

/*
|--------------------------------------------------------------------------
| Model Factories
|--------------------------------------------------------------------------
|
| This directory should contain each of the model factory definitions for
| your application. Factories provide a convenient way to generate new
| model instances for testing / seeding your application's database.
|
*/

$factory->define(App\Models\User::class, function (Faker $faker) {
    return [
        'name' => $faker->name,
        'email' => $faker->unique()->safeEmail,
        'company_id' => App\Models\Company::first()->id,
        'state_id' => App\Models\State::find(4)->id,
        'remember_token' => Str::random(10),
    ];
});
