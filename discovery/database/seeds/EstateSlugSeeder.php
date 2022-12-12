<?php

use App\Models\Lotmix\Estate;
use Illuminate\Database\Seeder;

class EstateSlugSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $estates = Estate::all();

        $estates->each(function (Estate $estate) {
            $estate->generateSlug();
            $estate->save();
        });
    }
}
