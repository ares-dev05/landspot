<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class RemoveHouseSvgIdIndexFromSitingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('sitings', function (Blueprint $table) {
            $table->dropForeign('sitings_house_svgs_id_foreign');
            $table->dropIndex('sitings_house_svgs_id_foreign');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('sitings', function (Blueprint $table) {
            $table->foreign('house_svgs_id')->references('id')->on('house_svgs');
        });
    }
}
