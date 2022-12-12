<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddChasFootprints extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('companies', 'chas_footprints')) {
            Schema::table('companies', function (Blueprint $table) {
                $table->tinyInteger('chas_footprints')->default(0);
                $table->tinyInteger('chas_discovery')->default(0);
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
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('chas_footprints');
            $table->dropColumn('chas_discovery');
        });
    }
}
