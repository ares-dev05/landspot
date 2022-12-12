<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEstateShortListsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::rename('estate_invited_users', 'estate_short_lists');

        Schema::create('short_lists', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('estate_short_list_id');
            $table->unsignedInteger('stage_id');
            $table->unsignedInteger('lot_id');
            
            $table->foreign('lot_id')
                ->references('id')
                ->on('lots')
                ->onDelete('cascade');
            $table->foreign('estate_short_list_id')
                ->references('id')
                ->on('estate_short_lists')
                ->onDelete('cascade');

            $table->foreign('stage_id')
                ->references('id')
                ->on('stages')
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
        Schema::dropIfExists('short_lists');
        Schema::rename('estate_short_lists', 'estate_invited_users');
    }
}
