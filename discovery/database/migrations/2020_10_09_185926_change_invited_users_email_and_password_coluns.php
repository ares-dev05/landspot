<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeInvitedUsersEmailAndPasswordColuns extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('invited_users', function (Blueprint $table) {
            $table->string('email', 150)->nullable()->change();
            $table->string('password', 255)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('invited_users', function (Blueprint $table) {
            $table->string('email', 150)->nullable(false)->change();
            $table->string('password', 255)->nullable(false)->change();
        });
    }
}
