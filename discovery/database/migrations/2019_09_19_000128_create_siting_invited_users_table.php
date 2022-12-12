<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSitingInvitedUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('siting_invited_users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('invited_user_id');
            $table->unsignedInteger('siting_id');

            $table->foreign('invited_user_id')
                ->references('id')
                ->on('invited_users')
                ->onDelete('restrict');

            $table->foreign('siting_id')
                ->references('id')
                ->on('sitings')
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
        Schema::dropIfExists('siting_invited_users');
    }
}
