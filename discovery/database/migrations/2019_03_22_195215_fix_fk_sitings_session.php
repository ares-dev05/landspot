<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class FixFkSitingsSession extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('sitting_sessions')) {
            try {
                Schema::table('sitting_sessions', function (Blueprint $table) {
                    $table->dropForeign('sitting_sessions_uid_foreign');
                });
            } catch (\Exception $e) {
            }
            try {
                Schema::table('sitting_sessions', function (Blueprint $table) {
                    $table->dropForeign('sitting_sessions_ibfk_4');
                });
            } catch (\Exception $e) {
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
