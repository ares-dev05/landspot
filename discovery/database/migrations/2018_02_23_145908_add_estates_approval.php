<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddEstatesApproval extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('estates', function (Blueprint $table) {
            $table->tinyInteger('approved')->unsigned()->default(0);
            $table->integer('state_id')->change();
            $table->foreign('state_id')->references('id')->on('house_states')->onDelete('restrict');
        });
        \DB::statement('UPDATE estates SET approved=1');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('estates', function (Blueprint $table) {
            $table->dropColumn('approved');
            $table->dropForeign('estates_state_id_foreign');
        });

        Schema::table('estates', function (Blueprint $table) {
            $table->integer('state_id')->unsigned()->change();
        });

    }
}
