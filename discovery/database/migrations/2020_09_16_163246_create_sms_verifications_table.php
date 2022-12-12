<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSmsVerificationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sms_verifications', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('invited_user_id')->unsigned()->unique();
            $table->string('code');
            $table->boolean('verified')->default(false);
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
        Schema::dropIfExists('sms_verifications');
    }
}
