<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateInvitedUserDocumentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('invited_user_documents', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('invited_user_id');
            $table->unsignedInteger('estate_id');
            $table->tinyInteger('type')->unsigned();
            $table->string('name', 255);
            $table->string('path', 255);
            $table->integer('open_count')->nullable()->unsigned()->default(0);
            $table->timestamps();

            $table->foreign('invited_user_id')
                ->references('id')
                ->on('invited_users')
                ->onDelete('restrict');

            $table->foreign('estate_id')
                ->references('id')
                ->on('estates')
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
        Schema::dropIfExists('invited_user_documents');
    }
}
