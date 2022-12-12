<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeEstates extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('estates', function (Blueprint $table) {
            $table->integer('state_id')->unsigned()->after('name');
            $table->string('geo_coords', 64)->nullable()->after('publish');
        });
        Schema::table('lots', function (Blueprint $table) {
            $table->string('geo_coords', 64)->nullable()->after('street');;
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('estates', function (Blueprint $table) {
            $table->dropColumn('geo_coords');
            $table->dropColumn('state_id');
        });

        Schema::table('lots', function (Blueprint $table) {
            $table->dropColumn('geo_coords');
        });
    }
}
