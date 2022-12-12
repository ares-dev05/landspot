<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class FixSitingsFloorplansCompanyId extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        \DB::statement('UPDATE `sitings_floorplans` SET `company_id` = (SELECT sso_company_id FROM `sitings_companies` WHERE `sitings_companies`.`id` = `sitings_floorplans`.`company_id`)');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
