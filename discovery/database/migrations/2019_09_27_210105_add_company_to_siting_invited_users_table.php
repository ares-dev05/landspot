<?php

use App\Models\SitingInvitedUsers;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddCompanyToSitingInvitedUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('siting_invited_users', function (Blueprint $table) {
            $table->integer('company_id');
        });

        SitingInvitedUsers::chunk(10, function ($userInvitedUsers) {
            $userInvitedUsers->each(function (SitingInvitedUsers $user) {
                $user->update([
                    'company_id' => $user->siting->user->company_id,
                ]);
            });
        });

        Schema::table('siting_invited_users', function (Blueprint $table) {
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
        Schema::disableForeignKeyConstraints();
        Schema::table('siting_invited_users', function (Blueprint $table) {
            $table->dropColumn('company_id');
        });
    }
}
