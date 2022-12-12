<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class RemoveReadedColumnFromBriefsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('briefs', function (Blueprint $table) {
            $table->dropColumn('readed');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('briefs', function (Blueprint $table) {
            $table->boolean('readed')->default(false)->after('completed_form');
        });
    }
}
