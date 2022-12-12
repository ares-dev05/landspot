<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddHasSitingAccessToLotmixStateSettingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('lotmix_state_settings', function (Blueprint $table) {
            $table->tinyInteger('has_siting_access')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('lotmix_state_settings', function (Blueprint $table) {
            $table->dropColumn('has_siting_access');
        });
    }
}
