<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddDocumentOwnerIdColumnToInvitedUserDocumentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('invited_user_documents', function (Blueprint $table) {
            $table->unsignedInteger('document_owner_id')->after('invited_user_id');
            $table->foreign('document_owner_id')
                ->references('id')
                ->on('uf_users')
                ->onDelete('restrict');
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
            $table->removeColumn('document_owner_id');
        });
    }
}
