<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateBriefCompanyTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('brief_company', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('brief_id');
            $table->integer('company_id');
            $table->boolean('accepted_brief')->nullable();
            $table->timestamps();

            $table->foreign('brief_id')
                ->references('id')
                ->on('briefs')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('company_id')
                ->references('id')
                ->on('companies')
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
        Schema::dropIfExists('brief_company');
    }
}
