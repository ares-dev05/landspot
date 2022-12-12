<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeHousesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
       DB::statement('SET @@session.time_zone=\'+00:00\'');
        Schema::table('houses', function (Blueprint $table) {
            $table->dropForeign('houses_house_svgs_id_foreign');
            $table->timestamp('parsed_at')->default(\DB::raw('\'1970-01-01 00:00:01\''));
        });
        \App\Models\HouseSvgs::fixUpdatedAtTimeStamp();
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::disableForeignKeyConstraints();
        Schema::table('houses', function (Blueprint $table) {
            $table->foreign('house_svgs_id')->references('id')->on('house_svgs');
            $table->dropColumn('parsed_at');
        });
        Schema::enableForeignKeyConstraints();
    }
}
