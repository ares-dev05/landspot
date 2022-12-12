<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class FixSizesHouse extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        \DB::unprepared("ALTER TABLE `house_attributes` CHANGE `width` `width` DOUBLE(8,2) UNSIGNED NULL DEFAULT NULL;");
        \DB::unprepared("ALTER TABLE `house_attributes` CHANGE `depth` `depth` DOUBLE(8,2) UNSIGNED NULL DEFAULT NULL;");
        \DB::unprepared("ALTER TABLE `house_attributes` CHANGE `size` `size` DOUBLE(8,2) UNSIGNED NULL DEFAULT NULL;");
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
