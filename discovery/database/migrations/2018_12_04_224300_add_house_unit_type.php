<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddHouseUnitType extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('house_attributes', function (Blueprint $table) {
            $table->string('size_units', 2)->default('m2')->after('size');
        });
        \DB::unprepared("ALTER TABLE `house_attributes` CHANGE `size` `size` DOUBLE DEFAULT NULL;");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('house_attributes', function (Blueprint $table) {
            $table->dropColumn('size_units');
        });
    }
}
