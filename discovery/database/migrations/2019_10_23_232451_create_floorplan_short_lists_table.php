<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFloorplanShortListsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('floorplan_short_lists', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('invited_user_id');
            $table->unsignedInteger('house_id');
            $table->unsignedInteger('facade_id');
            $table->timestamps();

            $table->foreign('invited_user_id')
                ->references('id')
                ->on('invited_users')
                ->onDelete('restrict');
            $table->foreign('house_id')
                ->references('id')
                ->on('houses')
                ->onDelete('restrict');
            $table->foreign('facade_id')
                ->references('id')
                ->on('facades')
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
        Schema::dropIfExists('floorplan_short_lists');
    }
}
