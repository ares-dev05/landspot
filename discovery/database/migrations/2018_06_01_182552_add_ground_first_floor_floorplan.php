<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddGroundFirstFloorFloorplan extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('floorplans', function (Blueprint $table) {
            $table->tinyInteger('floor', false, true)->nullable()->after('size');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('floorplans', function (Blueprint $table) {
            $table->dropColumn('floor');
        });
    }
}
