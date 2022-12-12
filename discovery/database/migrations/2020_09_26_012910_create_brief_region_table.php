<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateBriefRegionTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('brief_region', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('brief_id');
            $table->unsignedBigInteger('region_id');
            $table->timestamps();

            $table->foreign('brief_id')
                ->references('id')
                ->on('briefs')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('region_id')
                ->references('id')
                ->on('regions')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('brief_region');
    }
}
