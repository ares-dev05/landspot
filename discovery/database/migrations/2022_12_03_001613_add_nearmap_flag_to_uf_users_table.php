<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddNearmapFlagToUfUsersTable extends Migration
{
    const table = 'uf_users';

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table(self::table, function (Blueprint $table) {
            $table->tinyInteger('has_nearmap')->after('has_master_access')->default(0);
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
            $table->dropColumn('has_nearmap');
        });
    }
}
