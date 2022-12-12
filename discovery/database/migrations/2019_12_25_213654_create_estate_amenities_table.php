<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEstateAmenitiesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('estate_amenities', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('estate_id');
            $table->string('name', 100);
            $table->tinyInteger('type')->unsigned();
            $table->decimal('lat', 11, 8)->nullable();
            $table->decimal('long', 11, 8)->nullable();

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
        Schema::dropIfExists('estate_amenities');
    }
}
