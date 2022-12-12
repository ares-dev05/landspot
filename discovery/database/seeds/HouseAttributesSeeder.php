<?php

use App\Models\House;
use App\Models\HouseSvgs;
use App\Models\User;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\Auth;

class HouseAttributesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = Faker::create();

        HouseSvgs::fixUpdatedATtimeStamp();

        DB::table('facades')->truncate();
        DB::table('floorplans')->truncate();
        DB::table('galleries')->truncate();
        DB::table('options')->truncate();
        DB::table('volumes')->truncate();
        DB::table('house_attributes')->truncate();
        Schema::disableForeignKeyConstraints();
        DB::table('houses')->truncate();
        DB::table('ranges')->truncate();
        Schema::enableForeignKeyConstraints();

        $houses = House::addNewHousesFromSVG(true);

        foreach ($houses as $house) {
            $depth = $faker->numberBetween($min = 5, $max = 20);
            $width = $faker->numberBetween($min = 5, $max = 20);
            $house->attributes()->create([
                'house_id' => $house->id,
                'description' => $faker->paragraph,
                'story' => $faker->numberBetween($min = 1, $max = 2),
                'price' => $faker->numberBetween($min = 30000, $max = 1000000),
                'depth' => $depth,
                'width' => $width,
                'size' => $width*$depth,
                'beds' => $faker->numberBetween($min = 1, $max = 10),
                'bathrooms' => $faker->numberBetween($min = 3, $max = 5),
            ]);
            $house->floorplans()->updateOrCreate(
                [],
                [
                    'path' => $faker->imageUrl(800, 826)
                ]
            );

            foreach (range(0, 2) as $i) {
                $house->gallery()->create([
                    'house_id' => $house->id,
                    'path'     => '/facades/facade ('.rand(0,20).').jpg',
                ]);
            }

            $house->volume()->create([
                'house_id' => $house->id,
                'path' => 'https://my.matterport.com/show/?m=FmDYedjofjo&amp;play=1',
            ]);
            if ($house->facades->isEmpty()) {
                $house->facades()->create([
                    'house_id' => $house->id,
                    'title' => $faker->sentence,
                    'path' => $faker->imageUrl(1000,640)
                ]);
            } else {
                $facade = $house->facades->first();
                if (!$facade->path) {
                    $facade->path = $faker->imageUrl(1000, 640);
                    $facade->save();
                }
            }
            if ($house->options->isEmpty()) {
                $house->options()->create([
                    'house_id' => $house->id,
                    'title' => $faker->sentence,
                    'path' => $faker->imageUrl(1000,640)
                ]);
            }

            $house->update(['discovery' => 1]);
        }
    }
}
