<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUserInvitedUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::disableForeignKeyConstraints();
        Schema::table('invited_users', function (Blueprint $table) {
            $table->dropForeign('invited_users_user_id_foreign');
        });

        Schema::table('invited_users', function (Blueprint $table) {
            $table->dropColumn('user_id');
        });

        Schema::create('user_invited_users', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('user_id');
            $table->unsignedInteger('invited_user_id');

            $table->foreign('invited_user_id', 'invited_user_id_foreign')
                ->references('id')
                ->on('invited_users')
                ->onDelete('restrict');

            $table->foreign('user_id', 'user_id_foreign')
                ->references('id')
                ->on('uf_users')
                ->onUpdate('restrict')
                ->onDelete('restrict');

            $table->unique(['user_id', 'invited_user_id'], 'user_invited_user_unique');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user_invited_users');

        Schema::table('invited_users', function (Blueprint $table) {
            $table->unsignedInteger('user_id');
            $table->foreign('user_id')
                ->references('id')
                ->on('uf_users')
                ->onDelete('cascade');
        });
    }
}
