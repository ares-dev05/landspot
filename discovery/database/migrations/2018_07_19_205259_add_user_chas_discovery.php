<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddUserChasDiscovery extends Migration
{
    public function up()
    {
        Schema::table('uf_users', function (Blueprint $table) {
            $table->tinyInteger('chas_discovery')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('uf_users', function (Blueprint $table) {
            $table->dropColumn('chas_discovery');
        });
    }
}
