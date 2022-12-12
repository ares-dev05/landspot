<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateBriefEstateTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('brief_estate', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('brief_id');
            $table->integer('estate_id')->unsigned();
            $table->timestamps();

            $table->foreign('brief_id')
                ->references('id')
                ->on('briefs')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('estate_id')
                ->references('id')
                ->on('estates')
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
        Schema::dropIfExists('brief_estate');
    }
}
