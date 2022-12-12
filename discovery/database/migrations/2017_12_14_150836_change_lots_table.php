<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeLotsTable extends Migration
{
    public function up()
    {
        Schema::table('lots', function (Blueprint $table) {
            $table->unsignedInteger('packages')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('lots', function (Blueprint $table) {
            $table->dropColumn('packages');
        });
    }
}
