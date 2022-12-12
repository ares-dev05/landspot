<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class SitingsAddFloorplansTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sitings_floorplans', function (Blueprint $table) {
            $table->engine  = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');
            $table->integer('company_id');
            $table->unsignedInteger('range_id');
            $table->string('name', 100);
            $table->string('status', 32);
            $table->string('svg_path')->nullable();
            $table->string('svg_name')->nullable();
            $table->boolean('is_live')->default(0);
            $table->unsignedInteger('live_date');
            $table->unsignedInteger('created_at');
            $table->unsignedInteger('deleted_at')->nullable();
            $table->unsignedInteger('updated_at');
            $table->boolean('history');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('restrict');
            $table->foreign('range_id')->references('id')->on('ranges')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('sitings_floorplans');
    }
}

