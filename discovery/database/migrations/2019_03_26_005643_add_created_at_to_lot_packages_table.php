<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddCreatedAtToLotPackagesTable extends Migration
{
    const table = 'lot_packages';

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn(self::table, 'created_at')) {
            Schema::table(self::table, function (Blueprint $table) {
                $table->unsignedInteger('created_at')->default(0);
            });
        }

        if (!Schema::hasColumn(self::table, 'updated_at')) {
            Schema::table(self::table, function (Blueprint $table) {
                $table->unsignedInteger('updated_at')->default(0);
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table(self::table, function (Blueprint $table) {
            $table->dropColumn('created_at');
            $table->dropColumn('updated_at');
        });
    }
}
