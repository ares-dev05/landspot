<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddNccFieldsToSitingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('sitings', function (Blueprint $table) {
            $table->string('lot_no', 32)->after('extra_details')->nullable();
            $table->string('sp_no', 32)->after('lot_no')->nullable();
            $table->string('parent_lot_no', 32)->after('sp_no')->nullable();
            $table->string('parent_sp_no', 32)->after('parent_lot_no')->nullable();
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
            $table->dropColumn('lot_no');
            $table->dropColumn('sp_no');
            $table->dropColumn('parent_lot_no');
            $table->dropColumn('parent_sp_no');
        });
    }
}
