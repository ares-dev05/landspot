<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddTableDisableUserNotifications extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users_disabled_email_notifications', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('notification_user_id')->unsigned();
            $table->foreign('notification_user_id')->references('id')->on('uf_users')->onDelete('cascade');
            $table->unique('notification_user_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('users_disabled_email_notifications');
    }
}
