<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateHouseAttributesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::dropIfExists('house_attributes');

        Schema::create('house_attributes', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');
            $table->integer('house_id')->unsigned();
            $table->integer('beds')->unsigned()->nullable();
            $table->integer('bathrooms')->unsigned()->nullable();
            $table->integer('price')->unsigned()->nullable();
            $table->double('width', 5,2)->unsigned()->nullable();
            $table->double('depth', 5,2)->unsigned()->nullable();
            $table->double('size', 5,2)->unsigned()->nullable();
            $table->integer('story')->unsigned()->nullable();
            $table->integer('cars')->unsigned()->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('house_id')->references('id')->on('houses')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('house_attributes');
    }
}
