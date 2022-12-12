<?php

use App\Models\UserInvitedUsers;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ExpandUserInvitedUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::drop('company_invited_users');

        Schema::table('invited_users', function (Blueprint $table) {
            $table->dropColumn('invitation_token');
        });

        Schema::table('user_invited_users', function (Blueprint $table) {
            $table->integer('company_id');
            $table->string('invitation_token', 32)->unique()->nullable();
            $table->string('status', 32);
        });

        UserInvitedUsers::chunk(10, function ($userInvitedUsers) {
            $userInvitedUsers->each(function (UserInvitedUsers $user) {
                $user->update([
                    'company_id' => $user->landSpotUser->company_id,
                    'status' => UserInvitedUsers::STATUS_PENDING
                ]);
            });
        });

        Schema::table('user_invited_users', function (Blueprint $table) {
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
        Schema::table('invited_users', function (Blueprint $table) {
            $table->string('invitation_token', 32)->unique()->nullable();
        });

        Schema::table('user_invited_users', function (Blueprint $table) {
            $table->dropColumn('company_id');
            $table->dropColumn('invitation_token');
            $table->dropColumn('status');
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
}
