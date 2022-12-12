<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateBriefsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('briefs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('invited_user_id')->unsigned()->unique();
            $table->unsignedBigInteger('buyer_type_id');
            $table->string('land');
            $table->bigInteger('lot_number')->nullable();
            $table->string('street_name')->nullable();
            $table->string('estate_name')->nullable();
            $table->string('file_path')->nullable();
            $table->boolean('pre_approval');
            $table->boolean('process_of_personal_data');
            $table->boolean('completed_form')->default(false);
            $table->timestamps();

            $table->foreign('invited_user_id')
                ->references('id')
                ->on('invited_users')
                ->onUpdate('restrict')
                ->onDelete('restrict');

            $table->foreign('buyer_type_id')
                ->references('id')
                ->on('buyer_types')
                ->onUpdate('restrict')
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
        Schema::dropIfExists('briefs');
    }
}
