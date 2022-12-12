<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class SitingsAddFloorplanFilesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sitings_floorplan_files', function (Blueprint $table) {
            $table->engine  = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');
            $table->unsignedInteger('floorplan_id');
            $table->string('name', 100);
            $table->string('path');
            $table->text('note')->nullable();
            $table->unsignedInteger('created_at');
            $table->foreign('floorplan_id')
                  ->references('id')
                  ->on('sitings_floorplans')
                  ->onDelete('cascade')
                  ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('sitings_floorplan_files');
    }
}
