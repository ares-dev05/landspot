<?php

use Illuminate\Support\Facades\{Schema, DB};
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class MergeDiscoveryRanges extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::disableForeignKeyConstraints();
        DB::unprepared('ALTER TABLE house_ranges CONVERT TO CHARACTER SET utf8mb4');


        Schema::table('house_ranges', function (Blueprint $table) {
            $table->text('inclusions')->nullable();
            $table->timestamp('deleted_at')->nullable();
        });

        DB::table('ranges')->whereNotNull('old_range_id')
                           ->get()
                           ->each(function ($r) {
            DB::table('house_ranges')
              ->where('id', $r->old_range_id)
              ->update([
                  'inclusions' => $r->inclusions,
                  'deleted_at' => $r->deleted_at,
              ]);
        });
        Schema::table('houses', function (Blueprint $table) {
            $table->dropIndex('houses_range_id_foreign');
            $table->dropForeign('houses_range_id_foreign');
        });

        Schema::table('houses', function (Blueprint $table) {
            $table->integer('range_id')->change();
        });

        Schema::table('sitings_floorplans', function (Blueprint $table) {
            $table->dropForeign('sitings_floorplans_range_id_foreign');
            $table->dropIndex('sitings_floorplans_range_id_foreign');
        });

        Schema::table('sitings_floorplans', function (Blueprint $table) {
            $table->integer('range_id')->change();
        });

        DB::table('ranges')
          ->get()
          ->each(function ($r) {
              if ($r->old_range_id) {
                  $newRangeId = $r->old_range_id;
              } else {
                  $newRangeId = DB::table('house_ranges')
                                  ->insertGetId([
                                      'cid'        => $r->cid,
                                      'state_id'   => $r->state_id,
                                      'name'       => $r->name,
                                      'folder'     => '',
                                      'multihouse' => 0,
                                      'exclusive'  => 0,
                                      'inclusions' => $r->inclusions,
                                  ]);
              }

              DB::table('sitings_floorplans')
                ->where('range_id', $r->id)
                ->update(['range_id' => $newRangeId]);

              DB::table('houses')
                ->where('range_id', $r->id)
                ->update(['range_id' => $newRangeId]);
          });

        Schema::table('houses', function (Blueprint $table) {
            $table->foreign('range_id')
                  ->references('id')
                  ->on('house_ranges')
                  ->onUpdate('restrict')
                  ->onDelete('restrict');
        });

        Schema::table('sitings_floorplans', function (Blueprint $table) {
            $table->foreign('range_id')
                  ->references('id')
                  ->on('house_ranges')
                  ->onUpdate('restrict')
                  ->onDelete('restrict');
        });
        Schema::drop('ranges');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('house_ranges', function (Blueprint $table) {
            $table->dropColumn('inclusions', 'deleted_at');
        });
    }
}
