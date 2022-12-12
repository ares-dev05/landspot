<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEstatesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('estates', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');
            $table->integer('land_admin_id')->unsigned()->comment('Land Administrator id');
            $table->string('name')->nullable();
            $table->string('suburb')->nullable();
            $table->string('path')->nullable();
            $table->string('thumb')->nullable();
            $table->string('small')->nullable();
            $table->string('address')->nullable();
            $table->string('contacts')->nullable();
            $table->string('website')->nullable();
            $table->integer('publish')->unsigned()->default(0);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('estates');
    }
}
