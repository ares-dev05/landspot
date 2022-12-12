<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateChannelMessagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('chat_channel_messages', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8';
            $table->collation = 'utf8_general_ci';
            $table->increments('id');
            $table->unsignedInteger('channel_id');
            $table->unsignedInteger('user_id');
            $table->unsignedInteger('message_id')->nullable();
            $table->text('message');
            $table->unsignedInteger('created_at');
            $table->unsignedInteger('updated_at');

            $table->foreign('channel_id')->references('id')
                ->on('chat_channels')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('user_id')->references('id')
                ->on('uf_users')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('chat_channel_messages');
    }
}
