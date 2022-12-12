<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class NewEntities extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::disableForeignKeyConstraints();

        Schema::create('stages', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');
            $table->integer('estate_id')->unsigned();
            $table->string('name', 255)->nullable();
            $table->tinyInteger('published')->unsigned()->default(0);;
            $table->foreign('estate_id')->references('id')->on('estates')->onDelete('restrict');
        });

        Schema::table('lots', function (Blueprint $table) {
            $table->dropForeign('lots_estate_id_foreign');
            $table->dropColumn('estate_id');
            $table->integer('stage_id')->unsigned()->after('id');
            $table->tinyInteger('visibility')->unsigned();
            $table->foreign('stage_id')->references('id')->on('stages')->onDelete('restrict');
        });

        Schema::create('lot_packages', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');
            $table->integer('lot_id')->unsigned();
            $table->string('path', 255)->nullable();
            $table->foreign('lot_id')->references('id')->on('lots')->onDelete('restrict');
        });

        Schema::create('estate_docs', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');
            $table->integer('estate_id')->unsigned();
            $table->tinyInteger('type')->unsigned();
            $table->string('path', 255)->nullable();
            $table->foreign('estate_id')->references('id')->on('estate')->onDelete('restrict');
        });

        Schema::create('stage_docs', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');
            $table->integer('stage_id')->unsigned();
            $table->tinyInteger('type')->unsigned();
            $table->string('name')->nullable();
            $table->string('path', 255)->nullable();
            $table->foreign('stage_id')->references('id')->on('stages')->onDelete('restrict');
        });

        Schema::create('lots_visibility', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');
            $table->integer('lot_id')->unsigned();
            $table->integer('company_id');
            $table->foreign('lot_id')->references('id')->on('lots')->onDelete('cascade');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
        });

        Schema::table('estates', function (Blueprint $table) {
            $table->renameColumn('publish', 'published');
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
        Schema::dropIfExists('lots_visibility');
        Schema::dropIfExists('stage_docs');
        Schema::dropIfExists('estate_docs');
        Schema::dropIfExists('lot_packages');
        Schema::dropIfExists('stages');
        Schema::table('lots', function (Blueprint $table) {
            $table->dropForeign('lots_stage_id_foreign');
            $table->dropColumn('stage_id', 'visibility');

            $table->integer('estate_id')->unsigned()->after('id');
            $table->foreign('estate_id')->references('id')->on('estates')->onDelete('cascade');
        });

        Schema::table('estates', function (Blueprint $table) {
            $table->renameColumn('published', 'publish');
        });
    }
}
