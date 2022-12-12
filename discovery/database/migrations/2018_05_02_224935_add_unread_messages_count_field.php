<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddUnreadMessagesCountField extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_chats', function (Blueprint $table) {
            $table->unsignedInteger('unread_messages')->default(0);
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

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('user_chats', function (Blueprint $table) {
            $table->dropColumn('unread_messages');
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
              end;
          ');
    }
}
