<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeSitingsOwner extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::disableForeignKeyConstraints();
        Schema::table('sitings', function (Blueprint $table) {
            $table->dropIndex('sitings_user_id_foreign');
            $table->dropForeign('sitings_user_id_foreign');
        });

        \DB::statement('UPDATE `sitings` SET `user_id` = (SELECT sso_user_id FROM `sitings_users` WHERE `sitings_users`.`id` = `sitings`.`user_id`)');

        Schema::table('sitings', function (Blueprint $table) {
            $table->foreign('user_id')
                ->references('id')
                ->on('uf_users')
                ->onDelete('restrict')
                ->onUpdate('restrict');
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
        Schema::table('sitings', function (Blueprint $table) {
            $table->dropIndex('sitings_user_id_foreign');
            $table->dropForeign('sitings_user_id_foreign');
        });

        \DB::statement('UPDATE `sitings` SET `user_id` = (SELECT `id` FROM `sitings_users` WHERE `sitings_users`.`sso_user_id` = `sitings`.`user_id`)');

        Schema::table('sitings', function (Blueprint $table) {
            $table->foreign('user_id')
                ->references('id')
                ->on('sitings_users')
                ->onDelete('restrict')
                ->onUpdate('restrict');
        });
    }
}
