<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangePermissionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->unsignedSmallInteger('is_land_dev')->after('label')->default(0);
            $table->unsignedSmallInteger('is_builder')->after('is_land_dev')->default(0);
        });


        \DB::statement('UPDATE `permissions` SET is_land_dev = 1 WHERE `name`=\'price_editor\' OR `name`=\'list_manager\' OR `name`=\'read_only\'');
        \DB::statement('UPDATE `permissions` SET is_builder = 1 WHERE `name`=\'pdf_manager\'');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropColumn('is_land_dev');
            $table->dropColumn('is_builder');
        });
    }
}
