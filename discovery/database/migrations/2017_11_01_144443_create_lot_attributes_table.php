<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateLotAttributesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('lot_attributes', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');
            $table->integer('estate_id')->unsigned();
            $table->string('attr_name', 64)->nullable();
            $table->string('color',16)->nullable();
            $table->integer('is_currency')->unsigned()->default(0);
            $table->integer('order')->unsigned()->nullable();

            $table->foreign('estate_id')->references('id')->on('estates')->onDelete('cascade');
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
        Schema::dropIfExists('lot_attributes');
    }
}
