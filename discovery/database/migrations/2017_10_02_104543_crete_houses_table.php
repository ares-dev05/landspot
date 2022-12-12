<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreteHousesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('houses', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');
            $table->integer('house_svgs_id')->nullable();
            $table->integer('range_id');
            $table->string('title');
            $table->integer('discovery')->unsigned()->default(0);
            $table->timestamps();

            $table->foreign('house_svgs_id')->references('id')->on('house_svgs');
            $table->foreign('range_id')->references('id')->on('house_ranges');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('houses');
    }
}
