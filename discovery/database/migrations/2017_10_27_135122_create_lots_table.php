<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateLotsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('lots', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');
            $table->integer('estate_id')->unsigned();
            $table->integer('lot_number')->unsigned();
            $table->string('street')->nullable();
            $table->integer('frontage')->unsigned()->nullable();
            $table->integer('depth')->unsigned()->nullable();
            $table->integer('area')->unsigned()->nullable();
            $table->string('orientation')->nullable();
            $table->enum('status',['Avaliable','On Hold','Sold'])->nullable();
            $table->double('price',7,3)->unsigned()->nullable();
            $table->timestamps();

            $table->foreign('estate_id')->references('id')->on('estates');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('lots');
    }
}
