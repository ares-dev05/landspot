<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddIsGrantSupportAccessField extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('uf_users', function (Blueprint $table) {
            $table->unsignedSmallInteger('is_grant_support_access')->after('is_discovery_manager')->default(0);
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
            $table->dropColumn('is_grant_support_access');
        });
    }
}
