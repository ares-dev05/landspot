<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Artisan;

class CreateKaspaFormulasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('kaspa_formulas', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->text('description');
        });

        Artisan::call('db:seed', array('--class' => 'KaspaFormulaSeeder'));
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('kaspa_formulas');
    }
}
