<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddEstateIdColumnToInvitedUserDocumentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('invited_user_documents', function (Blueprint $table) {
            $table->unsignedInteger('estate_id')->nullable();
        });
        Schema::table('invited_user_documents', function (Blueprint $table) {
            $table->foreign('estate_id')
                ->references('id')
                ->on('estates')
                ->onDelete('set null');
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
            $table->dropForeign('invited_user_documents_estate_id_foreign');
            $table->dropColumn('estate_id');
        });
    }
}
