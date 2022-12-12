<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEstateGalleriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('estate_galleries', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('estate_id');
            $table->string('path');
            $table->string('name', 100)->nullable();

            $table->foreign('estate_id')
                ->references('id')
                ->on('estates')
                ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('estate_galleries');
    }
}
