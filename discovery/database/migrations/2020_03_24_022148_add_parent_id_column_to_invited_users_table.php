<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddParentIdColumnToInvitedUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('invited_users', function (Blueprint $table) {
            $table->unsignedInteger('parent_id')->nullable();
        });
        Schema::table('invited_users', function (Blueprint $table) {
            $table->foreign('parent_id')
                ->references('id')
                ->on('invited_users')
                ->onDelete('set null');
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
            $table->dropForeign('invited_users_parent_id_foreign');
            $table->dropColumn('parent_id');
        });
    }
}
