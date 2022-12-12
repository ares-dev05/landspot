<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSharedSitingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('shared_sitings', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('siting_id');
            $table->unsignedInteger('user_id');

            $table->foreign('siting_id')
                ->references('id')
                ->on('sitings')
                ->onDelete('cascade');
            $table->foreign('user_id')
                ->references('id')
                ->on('uf_users')
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
        Schema::dropIfExists('shared_sitings');
    }
}
