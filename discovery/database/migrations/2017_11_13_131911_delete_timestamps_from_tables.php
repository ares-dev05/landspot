<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class DeleteTimestampsFromTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('lot_values', function (Blueprint $table) {
            $table->dropTimestamps();
        });
        Schema::table('estates', function (Blueprint $table) {
            $table->dropTimestamps();
        });
        Schema::table('lot_attributes', function (Blueprint $table) {
            $table->dropTimestamps();
        });
        Schema::table('lots', function (Blueprint $table) {
            $table->dropTimestamps();
        });
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
