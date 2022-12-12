<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddFloorplanSizeField extends Migration
{
    public function up()
    {
        Schema::table('floorplans', function (Blueprint $table) {
            $table->double('size', 5,2)->unsigned()->nullable()->after('path');
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
            $table->dropColumn('size');
        });
    }
}
