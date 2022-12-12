<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddCompanyThemeColors extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('uf_users', function (Blueprint $table) {
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('restrict')->onUpdate('restrict');
        });

        if (Schema::hasTable('theme_colors') || Schema::hasTable('theme_groups')) {
            return;
        }

        DB::unprepared(file_get_contents(realpath(__DIR__ . '/theme_colors.sql')));
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('uf_users', function (Blueprint $table) {
            $table->dropForeign('uf_users_company_id_foreign');
            $table->dropIndex('uf_users_company_id_foreign');
        });
    }
}
