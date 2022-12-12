<?php

use App\Models\Sitings\Floorplan;
use App\Models\Sitings\FloorplanFiles;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class DropSitingsFloorplansTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::disableForeignKeyConstraints();

        FloorplanFiles::all()->each(function (FloorplanFiles $ff) {
            $ff->delete();
        });

        DB::table('sitings_floorplan_issues')->truncate();
        DB::table('sitings_floorplans_history')->truncate();

        Schema::table('sitings_floorplan_files', function (Blueprint $table) {
            $table->dropForeign('sitings_floorplan_files_floorplan_id_foreign');
            $table->dropIndex('sitings_floorplan_files_floorplan_id_foreign');
        });

        Schema::table('sitings_floorplan_issues', function (Blueprint $table) {
            $table->dropForeign('sitings_floorplan_issues_floorplan_id_foreign');
            $table->dropIndex('sitings_floorplan_issues_floorplan_id_foreign');
        });

        Schema::table('sitings_floorplans_history', function (Blueprint $table) {
            $table->dropForeign('sitings_floorplans_history_floorplan_id_foreign');
            $table->dropIndex('sitings_floorplans_history_floorplan_id_foreign');
        });

        Schema::table('sitings_floorplan_files', function (Blueprint $table) {
            $table->integer('floorplan_id')->change();
        });

        Schema::table('sitings_floorplan_issues', function (Blueprint $table) {
            $table->integer('floorplan_id')->change();
        });

        Schema::table('sitings_floorplans_history', function (Blueprint $table) {
            $table->integer('floorplan_id')->change();
        });

        Schema::dropIfExists('sitings_floorplans');

        Schema::table('sitings_floorplan_files', function (Blueprint $table) {
            $table->integer('floorplan_id')->change();
            $table->foreign('floorplan_id')
                ->references('id')
                ->on('house_svgs')
                ->onDelete('cascade')
                ->onUpdate('cascade');
        });

        Schema::table('sitings_floorplan_issues', function (Blueprint $table) {
            $table->integer('floorplan_id')->change();
            $table->foreign('floorplan_id')
                ->references('id')
                ->on('house_svgs')
                ->onDelete('cascade')
                ->onUpdate('cascade');
        });

        Schema::table('sitings_floorplans_history', function (Blueprint $table) {
            $table->integer('floorplan_id')->change();
            $table->foreign('floorplan_id')
                ->references('id')
                ->on('house_svgs')
                ->onDelete('cascade')
                ->onUpdate('cascade');
        });

        DB::unprepared('ALTER TABLE `house_svgs` CHANGE COLUMN updated_at updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

        Schema::table('house_svgs', function (Blueprint $table) {
            $table->text('area_data')->nullable()->change();
            $table->string('url', 256)->nullable()->change();
            $table->unsignedInteger('created_at')->after('area_data')->nullable();
            $table->unsignedInteger('deleted_at')->after('updated_at')->nullable();
            $table->unsignedInteger('live_date')->nullable();
            $table->string('status', 32)->default(Floorplan::STATUS_ATTENTION);
            $table->boolean('is_live')->default(0);
            $table->boolean('history')->default(0);
        });

        DB::statement("UPDATE `house_svgs` SET `status` = 'Active'");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
