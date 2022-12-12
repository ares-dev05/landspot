<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddHiddenToUfUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('uf_users', function (Blueprint $table) {
            $table->boolean('hidden')->default(false)->after('enabled')->comment('Hides the user from the user management table');
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
            $table->dropColumn('hidden');
        });
    }
}
