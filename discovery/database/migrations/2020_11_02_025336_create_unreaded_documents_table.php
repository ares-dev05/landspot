<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUnreadedDocumentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('unreaded_documents', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('invited_user_id')->unsigned();
            $table->integer('document_id')->unsigned();
            $table->string('document_type');
            $table->timestamps();

            $table->foreign('invited_user_id')
                ->references('id')
                ->on('invited_users')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('unreaded_documents');
    }
}
