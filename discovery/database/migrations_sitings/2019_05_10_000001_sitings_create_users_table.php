<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class SitingsCreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sitings_users', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('sso_user_id')->unique();
            $table->unsignedInteger('company_id')->index();
            $table->unsignedInteger('portal_access')->default(0);
            $table->string('display_name')->nullable();
            $table->string('email', 160)->unique();
            $table->string('auth_guard', 32);
            $table->text('access_token')->nullable();
            $table->text('refresh_token')->nullable();
            $table->foreign('company_id')->references('id')->on('sitings_companies')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('sitings_users');
    }
}
