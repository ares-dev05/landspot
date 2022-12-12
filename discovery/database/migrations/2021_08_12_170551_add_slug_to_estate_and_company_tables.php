<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddSlugToEstateAndCompanyTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('estates', function(Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('id');
        });


        Schema::table('companies', function(Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('id');
        });

        Artisan::call('db:seed', [
            '--class' => CompanySlugSeeder::class,
            '--force' => true
        ]);
        Artisan::call('db:seed', [
            '--class' => EstateSlugSeeder::class,
            '--force' => true
        ]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('estates', function(Blueprint $table) {
            $table->dropColumn('slug');
        });

        Schema::table('companies', function(Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
}
