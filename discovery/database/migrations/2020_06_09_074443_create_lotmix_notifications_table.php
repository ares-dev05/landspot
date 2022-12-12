<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateLotmixNotificationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('lotmix_notifications', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('title', 155);
            $table->mediumText('content');

            $table->unsignedInteger('sent_timestamp')->default(0);
            $table->unsignedInteger('created_at');
            $table->unsignedInteger('updated_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('lotmix_notifications');
    }
}
