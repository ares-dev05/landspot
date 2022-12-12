<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class SitingsCreateTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sitings', function (Blueprint $table) {
            $table->engine  = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');
            $table->unsignedInteger('user_id');
            $table->string('status', 32);

            $table->string('first_name', 155)->nullable();
            $table->string('last_name', 155)->nullable();
            $table->string('lot_number', 155)->nullable();
            $table->string('street', 155)->nullable();
            $table->text('extra_details')->nullable();

            $table->unsignedTinyInteger('page_size')->default(0);
            $table->unsignedInteger('page_scale')->default(200);

            $table->string('house', 64)->nullable();
            $table->string('facade', 64)->nullable();
            $table->string('options', 64)->nullable();

            $table->unsignedInteger('created_at');
            $table->unsignedInteger('updated_at');

            $table->foreign('user_id')
                  ->references('id')
                  ->on('sitings_users')
                  ->onDelete('restrict')
                  ->onUpdate('restrict');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('sitings');
    }
}
