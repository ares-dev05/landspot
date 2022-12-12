<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChatChangeMessageId extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('chat_channel_messages', function (Blueprint $table) {
            DB::statement('UPDATE chat_channel_messages SET message_id=0 WHERE message_id IS NULL');
            $table->unsignedBigInteger('message_id')->nullable()->change();
            $table->index(['channel_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('chat_channel_messages', function (Blueprint $table) {
            DB::statement('
            ALTER TABLE `lc-discovery`.`chat_channel_messages` DROP INDEX `chat_channel_messages_channel_id_created_at_index`, ADD INDEX `chat_channel_messages_channel_id_created_at_index` (`channel_id`) USING BTREE;
            ');
        });
    }
}
