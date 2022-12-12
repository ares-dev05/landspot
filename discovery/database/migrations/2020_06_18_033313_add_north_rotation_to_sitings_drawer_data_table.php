<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddNorthRotationToSitingsDrawerDataTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('sitings_drawer_data', function (Blueprint $table) {
            $table->unsignedDecimal('north_rotation', 10, 2)->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('sitings_drawer_data', function (Blueprint $table) {
            //
            $table->dropColumn('north_rotation');
        });
    }
}
