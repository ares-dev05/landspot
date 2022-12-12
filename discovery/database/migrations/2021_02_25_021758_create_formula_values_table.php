<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFormulaValuesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('formula_values', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->morphs('reference');
            $table->unsignedBigInteger('formula_id');
            $table->json('values');

            $table->foreign('formula_id')
                ->references('id')
                ->on('kaspa_formulas')
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
        Schema::dropIfExists('formula_values');
    }
}
