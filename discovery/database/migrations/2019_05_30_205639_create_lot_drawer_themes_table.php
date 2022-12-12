<?php

use App\Models\{
    LotDrawerData, File
};
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateLotDrawerThemesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('lot_drawer_themes', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');
            $table->unsignedInteger('stage_id');
            $table->string('path', 255)->nullable();
            $table->json('theme')->nullable();

            $table->foreign('stage_id')->references('id')->on('stages')->onDelete('restrict')->onUpdate('restrict');
        });

        LotDrawerData::chunk(10, function ($objects) {
            $objects->each(function (LotDrawerData $lotDrawerData) {
                if ($lotDrawerData->path && $lotDrawerData->path != '') {
                    File::deleteFile($lotDrawerData->path);
                }
            });
        });

        Schema::table('lot_drawer_data', function (Blueprint $table) {
            $table->smallInteger('view_scale')->default(1);
            $table->dropColumn('details');
            $table->dropColumn('path');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('lot_drawer_themes');

        Schema::table('lot_drawer_data', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->string('path', 255)->nullable();
            $table->json('details')->nullable();
            $table->dropColumn('view_scale');
        });
    }
}
