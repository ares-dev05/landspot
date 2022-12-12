<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEstateSnapshotsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('estate_snapshots', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('estate_id');
            $table->string('name', 128)->nullable();
            $table->integer('distance');
            $table->tinyInteger('type')->unsigned();
            $table->decimal('lat', 11, 8)->nullable();
            $table->decimal('long', 11, 8)->nullable();

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
        Schema::dropIfExists('estate_snapshots');
    }
}
