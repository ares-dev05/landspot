<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateInvitedUserNotificationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('invited_user_notifications', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');
            $table->unsignedInteger('invited_user_id');
            $table->unsignedBigInteger('lotmix_notification_id');
            $table->unsignedInteger('deleted_at')->nullable();
            $table->unsignedInteger('read_at')->nullable();

            $table->foreign('invited_user_id')->references('id')->on('invited_users')->onDelete('cascade');
            $table->foreign('lotmix_notification_id')->references('id')->on('lotmix_notifications')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('invited_user_notifications');
    }
}
