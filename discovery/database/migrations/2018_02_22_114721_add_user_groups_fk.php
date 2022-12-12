<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddUserGroupsFk extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        \DB::statement('DELETE FROM `uf_user_group_matches` WHERE user_id not in (SELECT id from uf_users)');
        \DB::statement('DELETE FROM `uf_user_group_matches` WHERE group_id not in (SELECT id from uf_groups)');

        Schema::table('uf_user_group_matches', function (Blueprint $table) {
            $table->integer('user_id')->unsigned()->change();
            $table->unique(['user_id', 'group_id']);
            $table->foreign('group_id')->references('id')->on('uf_groups')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('uf_users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('uf_user_group_matches', function (Blueprint $table) {
            $table->dropForeign('uf_user_group_matches_group_id_foreign');
            $table->dropForeign('uf_user_group_matches_user_id_foreign');
            $table->dropIndex('uf_user_group_matches_user_id_group_id_unique');
            $table->dropIndex('uf_user_group_matches_group_id_foreign');
        });

        Schema::table('uf_user_group_matches', function (Blueprint $table) {
            $table->integer('user_id')->change();
        });
    }
}
