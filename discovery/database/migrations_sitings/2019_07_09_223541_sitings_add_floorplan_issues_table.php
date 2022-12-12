<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class SitingsAddFloorplanIssuesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sitings_floorplan_issues', function (Blueprint $table) {
            $table->engine  = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->bigIncrements('id');
            $table->unsignedInteger('floorplan_id');
            $table->text('issue_text');
            $table->tinyInteger('status');
            $table->unsignedInteger('created_at');
            $table->foreign('floorplan_id')
                  ->references('id')
                  ->on('sitings_floorplans')
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
        Schema::drop('sitings_floorplan_issues');
    }
}
