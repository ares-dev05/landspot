<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEstateManagerPermissionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('estate_manager_permissions', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('estate_id')->unsigned();
            $table->integer('manager_id')->unsigned();
            $table->integer('permission_id')->unsigned();
            $table->foreign('estate_id')->references('id')->on('estates')->onDelete('cascade');
            $table->foreign('permission_id')->references('id')->on('permissions');
            $table->foreign('manager_id')->references('id')->on('uf_users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('estate_manager_permissions');
    }
}
