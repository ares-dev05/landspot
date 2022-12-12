<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEstateInvitedUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('estate_invited_users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('invited_user_id');
            $table->unsignedInteger('estate_id');

            $table->foreign('invited_user_id')
                ->references('id')
                ->on('invited_users')
                ->onDelete('restrict');

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
        Schema::dropIfExists('estate_invited_users');
    }
}
