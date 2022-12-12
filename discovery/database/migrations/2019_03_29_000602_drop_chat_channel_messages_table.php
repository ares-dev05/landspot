<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class DropChatChannelMessagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::dropIfExists('chat_channel_messages');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::create('chat_channel_messages', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8';
            $table->collation = 'utf8_general_ci';
            $table->increments('id');
            $table->unsignedInteger('channel_id');
            $table->unsignedInteger('user_id');
            $table->unsignedBigInteger('message_id')->nullable();
            $table->text('message');
            $table->unsignedInteger('created_at');
            $table->unsignedInteger('updated_at');

            $table->foreign('channel_id')->references('id')
                ->on('chat_channels')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('user_id')->references('id')
                ->on('uf_users')->onDelete('cascade')->onUpdate('cascade');

            $table->index(['channel_id', 'created_at']);
        });

        DB::unprepared('DROP TRIGGER update_last_message_ts');
        DB::unprepared('
            CREATE
              DEFINER = current_user
            TRIGGER `update_last_message_ts`
              AFTER INSERT
              ON `chat_channel_messages`
              for each row
              begin
                UPDATE user_chats
                SET last_message_ts = NEW.created_at,
                    last_message_id = NEW.id
                WHERE user_chats.channel_id = NEW.channel_id;
                
                UPDATE user_chats
                SET unread_messages = unread_messages + 1
                WHERE user_chats.channel_id = NEW.channel_id AND user_chats.user_id <> NEW.user_id ;
              end;
          ');
    }
}
