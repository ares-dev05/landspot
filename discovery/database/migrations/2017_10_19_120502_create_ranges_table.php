<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRangesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::dropIfExists('ranges');
        Schema::create('ranges', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');

            $table->integer('old_range_id')->nullable();
            $table->integer('cid')->comment = 'Company ID';
            $table->integer('state_id');
            $table->string('name', 255);

            $table->index('cid');

            $table->foreign('cid')->references('id')->on('companies')->onDelete('restrict');
            $table->foreign('state_id')->references('id')->on('house_states')->onDelete('restrict');
        });

        Schema::table('houses', function (Blueprint $table) {
            $table->dropForeign('houses_range_id_foreign');
        });

        Schema::disableForeignKeyConstraints();
        Schema::table('houses', function (Blueprint $table) {
            $table->integer('range_id')->unsigned()->change();
            $table->foreign('range_id')->references('id')->on('ranges')->onDelete('restrict');
        });
        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::disableForeignKeyConstraints();
        Schema::table('houses', function (Blueprint $table) {
            $table->dropForeign('houses_range_id_foreign');
        });
        Schema::table('houses', function (Blueprint $table) {
            $table->integer('range_id')->change();
            $table->foreign('range_id')->references('id')->on('house_ranges')->onDelete('restrict');
        });
        Schema::enableForeignKeyConstraints();
        Schema::dropIfExists('ranges');
    }
}
