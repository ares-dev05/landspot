<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeViewScaleColumnType extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('lot_drawer_data', function (Blueprint $table) {
            $table->unsignedDecimal('view_scale', 10, 2)->default(1)->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('lot_drawer_data', function (Blueprint $table) {
            $table->smallInteger('view_scale')->default(1)->change();
        });
    }
}
