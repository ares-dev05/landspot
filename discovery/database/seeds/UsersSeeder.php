<?php

use App\Models\User;
use Illuminate\Database\Seeder;
use \App\Models\UserGroup;
use \App\Models\Company;
use Faker\Factory as Faker;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = Faker::create();
        $password = password_hash('secret', PASSWORD_DEFAULT);
        $defaultGroup = UserGroup::defaultUsers()->firstOrFail();

        $company = Company::firstOrCreate([
            'type'               => 'developer',
            'name'               => 'Demo Developer Company',
            'builder_id'         => 'Demo Developer Company',
            'theme_id'           => 0,
            'chas_multihouse'    => 0,
            'chas_master_access' => 0,
            'chas_exclusive'     => 0
        ]);

        $developer = $company->user()->firstOrCreate(
            [
                'email'        => 'demolanddeveloper@demo.com',
                'user_name'    => 'Fake Land Developer',
                'company_id'   => $company->id,
                'state_id'     => 7,
                'display_name' => 'Fake Land Developer'
            ],
            [
                'password'                => $password,
                'last_activation_request' => 0,
                'lost_password_request'   => 0,
                'activation_token'        => '',
                'title'                   => $faker->title,
                'active'                  => 1,
                'verified'                => 1,
                'enabled'                 => 1,
                'sign_up_stamp'           => time(),
                'last_sign_in_stamp'      => time(),
            ]
        );


        if (!$developer->group()->exists()) {
            $group = UserGroup::developerAdmins()->firstOrFail();
            $developer->assignGroup($group);
            $developer->assignGroup($defaultGroup);
        }

        $estateManager = $company->user()->firstOrCreate(
            [
                'email'        => 'estatemanager@demo.com',
                'user_name'    => 'Fake Estate Manager',
                'company_id'   => $company->id,
                'state_id'     => 7,
                'display_name' => 'Fake Estate Manager',
            ],
            [
                'password'                => $password,
                'last_activation_request' => 0,
                'lost_password_request'   => 0,
                'activation_token'        => '',
                'title'                   => $faker->title,
                'active'                  => 1,
                'verified'                => 1,
                'enabled'                 => 1,
                'sign_up_stamp'           => time(),
                'last_sign_in_stamp'      => time(),
            ]
        );

        if (!$estateManager->group()->exists()) {            
            $estateManager->assignGroup($defaultGroup);
        }

        $builderCompany = \App\Models\Company::firstOrNew(
            ['type' => 'builder'],
            ['name' => 'Fake Builder Company']
        );

        $builderCompany->save();

        $builderDeveloper = $builderCompany->user()->firstOrCreate(
            [
                'email'        => 'fakebuilder@demo.com',
                'user_name'    => 'Fake Builder Name',
                'company_id'   => $builderCompany->id,
                'state_id'     => 7,
                'display_name' => 'Fake Builder',
            ],
            [
                'password'                => $password,
                'last_activation_request' => 0,
                'lost_password_request'   => 0,
                'activation_token'        => '',
                'title'                   => $faker->title,
                'active'                  => 1,
                'verified'                => 1,
                'enabled'                 => 1,
                'sign_up_stamp'           => time(),
                'last_sign_in_stamp'      => time(),
            ]
        );

        if (!$builderDeveloper->group()->exists()) {
            $group = UserGroup::builderAdmins()->firstOrFail();
            $builderDeveloper->assignGroup($group);
            $builderDeveloper->assignGroup($defaultGroup);
        }


        $superAdmin = User::firstOrCreate(
            [
                'email'        => 'superadmin@demo.com',
                'user_name'    => 'Super Admin',
                'company_id'   => 1,
                'state_id'     => 7,
                'display_name' => 'Super Admin',
            ],
            [
                'password'                => $password,
                'last_activation_request' => 0,
                'lost_password_request'   => 0,
                'activation_token'        => '',
                'title'                   => $faker->title,
                'active'                  => 1,
                'verified'                => 1,
                'enabled'                 => 1,
                'sign_up_stamp'           => time(),
                'last_sign_in_stamp'      => time(),
            ]);


        if (!$superAdmin->group()->exists()) {
            $group = UserGroup::superAdmins()->firstOrFail();
            $superAdmin->assignGroup($group);
            $superAdmin->assignGroup($defaultGroup);
        }
    }
}
