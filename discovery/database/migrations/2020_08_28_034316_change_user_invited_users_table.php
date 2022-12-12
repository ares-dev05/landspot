<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeUserInvitedUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_invited_users', function (Blueprint $table) {
            $table->unsignedInteger('user_id')->nullable()->change();
            $table->integer('company_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('user_invited_users', function (Blueprint $table) {
            $table->unsignedInteger('user_id')->change();
            $table->integer('company_id')->change();
        });
    }
}
