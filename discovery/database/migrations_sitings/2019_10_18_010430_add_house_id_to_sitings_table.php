<?php

use App\Models\Sitings\DrawerData;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddHouseIdToSitingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('sitings', function (Blueprint $table) {
            $table->integer('house_svgs_id')->nullable()->after('page_scale');
        });

        DrawerData::whereNotNull('data')
            ->chunk(10, function ($dataCollection) {
                $dataCollection->each(function (DrawerData $drawerData) {
                    $data = json_decode($drawerData->sitingSession, true);
                    $house_svgs_id = Arr::get($data, 'multiFloors.layers.0.houseData.house_svgs_id', null) ?: null;
                    $drawerData->siting->update(compact('house_svgs_id'));
            });
        });

        Schema::table('sitings', function (Blueprint $table) {
            $table->foreign('house_svgs_id')->references('id')->on('house_svgs')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('sitings', function (Blueprint $table) {
            $table->dropColumn('house_svgs_id');
        });
    }
}
