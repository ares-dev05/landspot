<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddAcceptedInviteAtAndEmailTypeColumnsToUserInvitedUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_invited_users', function (Blueprint $table) {
            $table->timestamp('accepted_invite_at')->nullable();
            $table->tinyInteger('email_type')->nullable();
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
            $table->dropColumn('accepted_invite_at');
            $table->dropColumn('email_type');
        });
    }
}
