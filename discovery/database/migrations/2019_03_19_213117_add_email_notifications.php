<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddEmailNotifications extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('email_notifications', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('notification_user_id');
            $table->string('type', 32);
            $table->unsignedTinyInteger('enabled');
            $table->unsignedInteger('sent_at');
            $table->unique(['notification_user_id', 'type']);
            $table->foreign('notification_user_id')->references('id')->on('uf_users')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('email_notifications');
    }
}
