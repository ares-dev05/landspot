<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddUserNameColumnsToInvitedUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('invited_users', function (Blueprint $table) {
            $table->string('first_name', 50)->after('id');
            $table->string('last_name', 50)->after('first_name');
        });

        \App\Models\InvitedUser::chunk(10, function ($invitedUsers) {
            $invitedUsers->each(function (\App\Models\InvitedUser $user) {
                list($first_name, $last_name) = explode(' ', $user->display_name);
                $user->update(compact('first_name', 'last_name'));
            });
        });

        Schema::table('invited_users', function (Blueprint $table) {
            $table->dropColumn('display_name');
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
            $table->string('display_name', 50);
        });

        \App\Models\InvitedUser::chunk(10, function ($invitedUsers) {
            $invitedUsers->each(function (\App\Models\InvitedUser $user) {
                $display_name = $user->first_name . ' ' . $user->last_name;
                $user->update(compact('display_name'));
            });
        });

        Schema::table('invited_users', function (Blueprint $table) {
            $table->dropColumn('first_name');
            $table->dropColumn('last_name');
        });
    }
}
