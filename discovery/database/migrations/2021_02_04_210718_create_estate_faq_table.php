<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEstateFaqTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('estate_faq', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('estate_id');
            $table->tinyInteger('question_type')->unsigned();
            $table->string('answer', 1000)->nullable();

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
        Schema::dropIfExists('estate_faq');
    }
}
