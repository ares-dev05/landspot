<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddLotPackagesFields extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::disableForeignKeyConstraints();
        Schema::table('lot_packages', function (Blueprint $table) {
            $table->integer('facade_id', false, true);
            $table->integer('price', false, true);
            $table->foreign('facade_id')->references('id')->on('facades')->onDelete('restrict')->onUpdate('restrict');;
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('lot_packages', function (Blueprint $table) {
            $table->dropForeign('lot_packages_facade_id_foreign');
            $table->dropColumn('facade_id', 'price');
        });
    }
}
