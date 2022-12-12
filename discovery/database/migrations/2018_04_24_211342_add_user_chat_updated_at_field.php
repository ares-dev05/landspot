<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddUserChatUpdatedAtField extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_chats', function (Blueprint $table) {
            $table->unsignedInteger('last_message_id')->default(0);
            $table->unsignedInteger('last_message_ts')->default(0);
        });
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

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::unprepared('DROP TRIGGER update_last_message_ts');
        Schema::table('user_chats', function (Blueprint $table) {
            $table->dropColumn('last_message_ts', 'last_message_id');
        });
    }
}
