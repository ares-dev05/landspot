<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ExtendStageTable extends Migration
{
    const table = 'stages';

    public function up()
    {
        Schema::table(self::table, function (Blueprint $table) {
            $table->tinyInteger('sold', false, true)->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table(self::table, function (Blueprint $table) {
            $table->dropColumn('sold');
        });
    }
}
