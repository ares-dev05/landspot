<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('uf_users', function (Blueprint $table) {
            $table->string('phone', 20)->after('email')->nullable();
            $table->unsignedSmallInteger('is_global_estate_manager')->after('state_id')->default(0);
            $table->unsignedSmallInteger('is_user_manager')->after('is_global_estate_manager')->default(0);
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
            $table->dropColumn('phone');
            $table->dropColumn('is_global_estate_manager');
            $table->dropColumn('is_user_manager');
        });
    }
}
