<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class SitingsCreateDrawerDataTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sitings_drawer_data', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->bigIncrements('id');
            $table->unsignedInteger('siting_id');
            $table->unsignedInteger('page_id')->nullable();
            $table->smallInteger('rotation')->nullable();
            $table->unsignedDecimal('view_scale', 10, 2)->default(1);

            $table->mediumText('data')->nullable();
            $table->boolean('mirrored')->default(0);

            $table->foreign('siting_id')
                  ->references('id')
                  ->on('sitings')
                  ->onDelete('restrict')
                  ->onUpdate('restrict');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('sitings_drawer_data');
    }
}
