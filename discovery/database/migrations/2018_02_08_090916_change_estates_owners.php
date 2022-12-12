<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeEstatesOwners extends Migration
{
    const table = 'estates';

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::disableForeignKeyConstraints();
        Schema::table(self::table, function (Blueprint $table) {
            $table->integer('company_id')->after('id');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('restrict');
        });

        \DB::statement(
            "UPDATE " . self::table . " e
            JOIN uf_users u ON u.id = e.land_admin_id
            SET e.company_id = u.company_id"
        );

        Schema::table(self::table, function (Blueprint $table) {
            $table->dropForeign('estates_land_admin_id_foreign');
            $table->dropColumn('land_admin_id');
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
        Schema::table(self::table, function (Blueprint $table) {
            $table->dropColumn('company_id');
            $table->integer('land_admin_id', false, true)->after('id');
        });
    }
}
