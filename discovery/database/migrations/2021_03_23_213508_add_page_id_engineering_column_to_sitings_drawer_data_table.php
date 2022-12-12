<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddPageIdEngineeringColumnToSitingsDrawerDataTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('sitings_drawer_data', function (Blueprint $table) {
            $table->unsignedInteger('page_id_engineering')->after('page_id')->nullable();
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
            $table->dropColumn('page_id_engineering');
        });
    }
}
