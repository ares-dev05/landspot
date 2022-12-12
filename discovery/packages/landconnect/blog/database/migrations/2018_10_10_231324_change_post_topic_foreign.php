<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangePostTopicForeign extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::disableForeignKeyConstraints();
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropForeign(['topic_id']);
            $table->foreign('topic_id')->references('id')->on('blog_topics');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::disableForeignKeyConstraints();
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropForeign(['topic_id']);
            $table->foreign('topic_id')->references('id')->on('blog_topics')->onDelete('cascade')->onUpdate('cascade');
        });
    }
}
