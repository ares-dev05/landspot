<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddVerifyTokenColumn extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('uf_users', function (Blueprint $table) {
            $table->string('verify_token', 30)->after('phone')->nullable();
            $table->unsignedSmallInteger('verified')->after('verify_token')->default(0);
        });

        DB::table('uf_users')->update(['verified' => 1]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('uf_users', function (Blueprint $table) {
            $table->dropColumn('verify_token');
            $table->dropColumn('verified');
        });
    }
}
