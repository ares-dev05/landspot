<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddUserNotificationMissedColumn extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_notification', function (Blueprint $table) {
            $table->unsignedInteger('deleted_at')->nullable();
            $table->unsignedInteger('read_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('user_notification', function (Blueprint $table) {
            $table->dropColumn('deleted_at');
            $table->dropColumn('read_at');
        });
    }
}
