<?php

use Illuminate\Database\Migrations\Migration;

class ChangeDepthToText extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        \DB::statement('ALTER TABLE `lots` CHANGE `depth` `depth` VARCHAR(64) NULL DEFAULT NULL;');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        \DB::statement('ALTER TABLE `lots` CHANGE `depth` `depth` DECIMAL(10,2) NULL DEFAULT NULL;');

    }
}
