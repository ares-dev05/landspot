<?php

use App\Models\State;
use Illuminate\Database\Seeder;
use \Modules\Sitings\Entities\{Company, Floorplan};
use Faker\Factory as Faker;

class SitingsDatabaseSeeder extends Seeder
{
    /**
     * @throws \Exception
     */
    public function run()
    {
        $faker = Faker::create();
        /** @var Company $company */
        $company = Company::first();
        if (!$company) {
            throw new \Exception('No companies');
        }

        $states = State::all()->pluck('id');

        if (!$company->ranges()->exists()) {
            foreach (range(0, 2) as $value) {
                $company->ranges()->create([
                    'name'     => $faker->streetName,
                    'state_id' => $states->random()
                ]);
            }
        }
        $company->floorplans()->delete();

        foreach (range(0, 40) as $value) {
            /** @var Floorplan $f */
            $f = $company->floorplans()->create([
                'range_id'  => $company->ranges->random()->id,
                'name'      => $faker->company,
                'status'    => $faker->randomElement([
                    Floorplan::STATUS_ACTIVE,
                    Floorplan::STATUS_ATTENTION,
                    Floorplan::STATUS_AWAITING_APPROVAL,
//                    Floorplan::STATUS_IN_PROGRESS,
                ]),
                'live_date' => $faker->randomElement([$faker->unixTime, 0]),
            ]);

            if (rand(0, 10) > 5) {
                foreach (range(0, 25) as $value) {
                    $f->insertNote($faker->text);
                }
            }
        }
    }
}
