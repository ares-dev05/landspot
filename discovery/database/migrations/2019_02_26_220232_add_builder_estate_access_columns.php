<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddBuilderEstateAccessColumns extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('uf_users', function (Blueprint $table) {
            $table->boolean('disabled_estates_access')->default(0);
        });
        Schema::table('companies', function (Blueprint $table) {
            $table->boolean('chas_estates_access')->after('chas_discovery')->default(0);
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
            $table->dropColumn('disabled_estates_access');
        });
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('chas_estates_access');
        });
    }
}
