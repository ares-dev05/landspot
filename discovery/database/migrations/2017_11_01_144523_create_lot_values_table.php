<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateLotValuesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('lot_values', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');
            $table->integer('lot_id')->unsigned();
            $table->integer('lot_attr_id')->unsigned();
            $table->string('value', 64)->nullable();


            $table->foreign('lot_id')->references('id')->on('lots')->onDelete('cascade');
            $table->foreign('lot_attr_id')->references('id')->on('lot_attributes')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('lot_values');
    }
}
