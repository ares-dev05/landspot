<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeFloorplansTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('floorplans', function (Blueprint $table) {
            $table->string('thumb')->after('path')->nullable();
            $table->string('small')->after('thumb')->nullable();
            $table->string('medium')->after('small')->nullable();
            $table->string('large')->after('medium')->nullable();
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
            $table->dropColumn('thumb');
            $table->dropColumn('small');
            $table->dropColumn('medium');
            $table->dropColumn('large');
        });
    }
}
