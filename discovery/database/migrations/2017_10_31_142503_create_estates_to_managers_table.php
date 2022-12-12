<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEstatesToManagersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::disableForeignKeyConstraints();
        Schema::create('estate_managers', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('estate_id')->unsigned();
            $table->integer('manager_id')->unsigned();
            $table->foreign('estate_id')->references('id')->on('estates');
            $table->foreign('manager_id')->references('id')->on('uf_users')->onDelete('cascade');
        });
        Schema::dropIfExists('users');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('estate_managers');
        Schema::create('users', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');
            $table->string('name');
            $table->string('email', 160)->unique();
            $table->integer('company_id')->unsigned();
            $table->integer('state_id')->unsigned();
            $table->rememberToken();
            $table->timestamps();
        });

    }
}
