<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddOrderToUserInvitedUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_invited_users', function (Blueprint $table) {
            $table->integer('order')->unsigned()->default(0);
        });

        \DB::unprepared('
            CREATE TRIGGER `update_invitation_order`
              BEFORE UPDATE
              ON `user_invited_users`
              FOR EACH ROW
              BEGIN
                IF OLD.status = "pending" AND
                NEW.status = "claimed" THEN
                SET NEW.order = (SELECT max(`order`) FROM `user_invited_users` WHERE user_invited_users.invited_user_id = NEW.invited_user_id) + 1;
                END IF;
              END;
          ');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::unprepared('DROP TRIGGER update_invitation_order');
        Schema::table('user_invited_users', function (Blueprint $table) {
            $table->dropColumn('order');
        });
    }
}
