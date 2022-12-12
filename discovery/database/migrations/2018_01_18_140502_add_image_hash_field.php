<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddImageHashField extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    const tables = ['facades', 'floorplans', 'galleries', 'options'];

    public function up()
    {
        foreach (self::tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->string('file_hash', 32)->nullable();
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
        foreach (self::tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn('file_hash');
            });
        }
    }
}
