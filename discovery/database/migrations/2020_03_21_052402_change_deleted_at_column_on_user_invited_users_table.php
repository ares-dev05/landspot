<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeDeletedAtColumnOnUserInvitedUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_invited_users', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::table('user_invited_users', function (Blueprint $table) {
            $table->softDeletes();
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
            $table->dropSoftDeletes();
        });
    }
}
