<?php

use App\Models\SitingInvitedUsers;
use App\Models\Sitings\Siting;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddStatusColumnToSitingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('sitings', function (Blueprint $table) {
            $table->tinyInteger('status', false, true)->after('options')->default(0);
        });

        $sitingsIds = SitingInvitedUsers::select('siting_id')
            ->groupBy('siting_id')
            ->pluck('siting_id')
            ->toArray();
        Siting::whereIn('id', $sitingsIds)->update(['status' => Siting::STATUS_COMPLETED]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('sitings', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
}
