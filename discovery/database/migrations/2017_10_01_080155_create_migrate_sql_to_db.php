<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMigrateSqlToDb extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!(Schema::hasTable('companies')) &&
            !(Schema::hasTable('house_ranges')) &&
            !(Schema::hasTable('house_states')) &&
            !(Schema::hasTable('house_svgs'))) {
            $file = realpath(__DIR__ . '/peacedo1_db.sql');
            DB::unprepared(file_get_contents($file));
        }

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {

    }
}
