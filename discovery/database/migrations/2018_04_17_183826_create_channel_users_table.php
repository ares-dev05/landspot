<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateChannelUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_chats', function (Blueprint $table) {
            $table->integer('channel_id')->unsigned();
            $table->integer('user_id')->unsigned();
            $table->unsignedInteger('readed_at')->nullable();

            $table->foreign('channel_id')->references('id')->on('chat_channels')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('user_id')->references('id')->on('uf_users')->onDelete('cascade')->onUpdate('cascade');

            $table->unique(['channel_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user_chats');
    }
}
