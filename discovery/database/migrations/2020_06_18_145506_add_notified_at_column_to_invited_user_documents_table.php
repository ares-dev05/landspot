<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddNotifiedAtColumnToInvitedUserDocumentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('invited_user_documents', function (Blueprint $table) {
            $table->timestamp('notified_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('invited_user_documents', function (Blueprint $table) {
            $table->dropColumn('notified_at');
        });
    }
}
