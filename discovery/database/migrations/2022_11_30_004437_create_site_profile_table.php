<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSiteProfileTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('site_profiles', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');

            // company / state associations
            $table->integer('company_id');
            $table->integer('state_id');

            // profile location parameters. not all have to be set
            $table->string('zone', 255)->nullable();
            $table->string('subzone', 255)->nullable();
            $table->string('suburb', 255)->nullable();
            $table->string('estate', 255)->nullable();

            // cost / rules profiles
            $table->mediumText('costs_data')->nullable();
            $table->mediumText('rules_data')->nullable();

            // foreign keys
            $table->foreign('state_id')->references('id')->on('house_states')->onDelete('restrict');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('restrict');
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
        Schema::dropIfExists('site_profiles');
    }
}
