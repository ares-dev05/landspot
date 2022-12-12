<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class FixHouseSvgsTimestamps extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::unprepared('ALTER TABLE `house_svgs` CHANGE COLUMN created_at created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');
        DB::unprepared('ALTER TABLE `house_svgs` CHANGE COLUMN deleted_at deleted_at TIMESTAMP NULL');
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
