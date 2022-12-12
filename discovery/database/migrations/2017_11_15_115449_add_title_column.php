<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddTitleColumn extends Migration
{
    public function up()
    {
        Schema::table('lot_attributes', function (Blueprint $table) {
            $table->string('display_name', 64)->after('attr_name');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('lot_attributes', function (Blueprint $table) {
            $table->dropColumn('display_name');
        });
    }
}
