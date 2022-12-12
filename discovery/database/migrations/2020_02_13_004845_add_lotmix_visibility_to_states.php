<?php

use App\Models\LotmixStateSettings;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddLotmixVisibilityToStates extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('lotmix_state_settings', function (Blueprint $table) {
            $table->unsignedTinyInteger('has_lotmix')->default(LotmixStateSettings::LOTMIX_ACCESS_DISABLED);
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
            $table->dropColumn('has_lotmix');
        });
    }
}
