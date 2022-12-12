<?php

use App\Models\Sitings\Siting;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddNewFieldsToSitingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('sitings', function (Blueprint $table) {
            $table->double('lot_area')->after('lot_number')->nullable();
            $table->double('site_coverage')->after('lot_area')->nullable();
        });

        $sitings = App\Models\Sitings\Siting::whereHas('drawerData')->get();
        $sitings->each(function (Siting $siting){
            try{
                $ssData = json_decode($siting->drawerData->sitingSession, 1);
                if (!empty($ssData) && !empty($ssData['areaData'])){
                    $areaData = $ssData['areaData'];
                    $lotArea = $areaData['lotArea'];
                    $totalCoverage = $areaData['totalCoverage'];
                    $siting->update(['lot_area' => $lotArea, 'site_coverage' => $totalCoverage]);
                }
            } catch (Exception $e){
                echo $e->getMessage() . PHP_EOL;
            }
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
            $table->dropColumn('lot_area');
            $table->dropColumn('site_coverage');
        });
    }
}
