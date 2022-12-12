<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddInvitedUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('invited_users', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('user_id');
            $table->boolean('accepted_tos')->default(0);
            $table->string('email', 150);
            $table->string('display_name', 50);
            $table->string('phone', 20)->nullable();
            $table->string('password', 255);
            $table->unsignedInteger('last_sign_in_stamp');
            $table->foreign('user_id')
                  ->references('id')
                  ->on('uf_users')
                  ->onDelete('cascade');
        });

        Schema::create('company_invited_users', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('company_id');
            $table->unsignedInteger('invited_user_id');

            $table->foreign('invited_user_id')
                  ->references('id')
                  ->on('invited_users')
                  ->onDelete('restrict');

            $table->foreign('company_id')
                  ->references('id')
                  ->on('companies')
                  ->onUpdate('restrict')
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
        Schema::drop('company_invited_users');
        Schema::drop('invited_users');
    }
}
