<?php

use App\Models\Lot;
use App\Models\Estate;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class EstatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $estateManager = \App\Models\EstateManager::findByEmail('estatemanager@demo.com');
        $developer = \App\Models\LandDeveloper::findByEmail('demolanddeveloper@demo.com');

        if (App::environment('local')) {
            \DB::table('pdf_lots_template')->delete();
            \DB::table('lot_packages')->delete();
            \DB::table('lot_packages')->delete();
            \DB::table('lots_visibility')->delete();
            \DB::table('lot_values')->delete();
            \DB::table('lot_attributes')->delete();
            \DB::table('stage_docs')->delete();
            \DB::table('lots')->delete();
            \DB::table('stages')->delete();
            \DB::table('estates')->delete();
        }

        $faker = Faker::create();

        for ($i = 0; $i < 5; $i++) {
            /**
             * @var Estate
             */
            $estate = $developer->estate()->create([
                'name'       => $faker->sentence(5),
                'state_id'   => $developer->state_id,
                'suburb'     => $faker->city,
                'path'       => $faker->imageUrl(1000, 640),
                'thumb'      => $faker->imageUrl(1000, 640),
                'small'      => $faker->imageUrl(1000, 640),
                'contacts'   => $faker->e164PhoneNumber,
                'address'    => $faker->address,
                'geo_coords' =>
                    $faker->latitude(-33.925766, -33.758610) . ',' .
                    $faker->longitude(150.945362, 151.251247),
                'website'    => $faker->domainName,
                'published'    => rand(0, 1)
            ]);

            $lotAttributes = $estate->lotAttributes()->create([
                'attr_name' => $faker->word,
                'display_name' => $faker->word,
                'color' => $faker->hexcolor,
                'column_type' => 'dynamic',
            ]);

            foreach (range(0, 1) as $s) {
                $stage = $estate->stage()->create([
                    'name'      => $faker->sentence(5),
                    'published' => $s % 2
                ]);

                $lotsCount = rand(1, 50);

                while ($lotsCount-- > 0) {
                    $lots = $stage->lots()->create([
                        'frontage'    => $faker->numberBetween($min = 5, $max = 20),
                        'depth'       => $faker->numberBetween($min = 5, $max = 20),
                        'area'        => $faker->numberBetween($min = 5, $max = 20),
                        'status'      => $faker->randomElement(Lot::status),
                        'geo_coords'  =>
                            $faker->latitude(-33.925766, -33.758610) . ',' .
                            $faker->longitude(150.945362, 151.251247),
                        'price'       => $faker->numberBetween($min = 10000, $max = 100000),
                        'visibility'  => Lot::visibility['all']
                    ]);


                    $lots->lotValues()->create([
                        'lot_attr_id' => $lotAttributes->id,
                        'value'       => $faker->word,
                    ]);
                }
            }

            $estateManager->estate()->attach($estate->id);
        }
    }
}
