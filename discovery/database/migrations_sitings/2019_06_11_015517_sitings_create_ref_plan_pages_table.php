<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class SitingsCreateRefPlanPagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sitings_ref_plan_pages', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->bigIncrements('id');
            $table->unsignedInteger('file_id');
            $table->unsignedInteger('page');
            $table->unsignedInteger('width');
            $table->unsignedInteger('height');
            $table->string('thumb', 255);

            $table->foreign('file_id')
                  ->references('id')
                  ->on('sitings_ref_plans')
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
        Schema::drop('sitings_ref_plan_pages');
    }
}
