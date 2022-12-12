<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddEstateManagersFk extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement('DELETE FROM `estate_managers` WHERE estate_id not in (SELECT id from estates)');
        DB::statement('DELETE FROM `estate_managers` WHERE manager_id not in (SELECT id from uf_users)');

        Schema::table('estate_managers', function (Blueprint $table) {

            $doctrineTable = Schema::getConnection()
                ->getDoctrineSchemaManager()
                ->listTableDetails('estate_managers');

            if ($doctrineTable->hasIndex('estate_managers_manager_id_foreign')) {
                $table->dropIndex('estate_managers_manager_id_foreign');
            }

            if ($doctrineTable->hasIndex('estate_managers_estate_id_foreign')) {
                $table->dropIndex('estate_managers_estate_id_foreign');
            }
            $table->unique(['estate_id', 'manager_id']);
//            $table->foreign('estate_id')->references('id')->on('estates')->onDelete('cascade')->onUpdate('cascade');
//            $table->foreign('manager_id')->references('id')->on('uf_users')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('estate_managers', function (Blueprint $table) {
            $table->dropForeign('estate_managers_estate_id_foreign');
            $table->dropForeign('estate_managers_manager_id_foreign');
            $table->dropIndex('estate_managers_estate_id_manager_id_unique');
            $table->dropIndex('estate_managers_manager_id_foreign');
        });
    }
}
