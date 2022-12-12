<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ClosedSupportSessions extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('closed_support_sessions', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('global_admin_id')->unsigned();
            $table->integer('user_id')->unsigned();
            $table->foreign('global_admin_id')->references('id')->on('uf_users')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('uf_users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('closed_support_sessions');
    }
}
