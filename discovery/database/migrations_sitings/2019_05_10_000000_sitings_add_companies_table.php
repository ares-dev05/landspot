<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class SitingsAddCompaniesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sitings_companies', function (Blueprint $table) {
            $table->engine  = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');
            $table->integer('sso_company_id')->unique();
            $table->string('name', 160);
            $table->text('company_logo')->nullable();
            $table->text('company_small_logo')->nullable();
            $table->text('company_expanded_logo')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('sitings_companies');
    }
}
