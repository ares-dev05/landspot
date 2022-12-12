<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeUsersReference extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::disableForeignKeyConstraints();

        if (Schema::hasTable('pt_watcher')) {
            DB::statement('ALTER TABLE pt_watcher DROP foreign key pt_watcher_ibfk_1');
            DB::statement('ALTER TABLE `pt_watcher` DROP INDEX uid');
        }

        if (Schema::hasTable('sitting_sessions')) {
            DB::statement('ALTER TABLE sitting_sessions DROP foreign key sitting_sessions_ibfk_1');
        }

        Schema::table('uf_users', function (Blueprint $table) {
            $table->increments('id')->unsigned()->change();
        });
        Schema::table('estates', function (Blueprint $table) {
            $table->foreign('land_admin_id')->references('id')->on('uf_users');
        });


        if (Schema::hasTable('pt_watcher')) {
            Schema::table('pt_watcher', function (Blueprint $table) {
                $table->integer('uid')->unsigned()->change();
                $table->foreign('uid')->references('id')->on('uf_users')->onDelete('cascade')->onUpdate('cascade');
            });
        }

        if (Schema::hasTable('sitting_sessions')) {
            Schema::table('sitting_sessions', function (Blueprint $table) {
                $table->integer('uid')->unsigned()->change();
                $table->foreign('uid')->references('id')->on('uf_users');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::disableForeignKeyConstraints();
        Schema::table('estates', function (Blueprint $table) {
            $table->dropForeign('estates_land_admin_id_foreign');
            $table->foreign('land_admin_id')->references('id')->on('users');
        });

        Schema::table('uf_users', function (Blueprint $table) {
            $table->integer('id', true)->change();
        });
    }
}
