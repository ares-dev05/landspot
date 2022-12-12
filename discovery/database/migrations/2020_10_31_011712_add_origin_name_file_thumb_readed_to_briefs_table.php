<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddOriginNameFileThumbReadedToBriefsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('briefs', function (Blueprint $table) {
            $table->string('origin_name_file')->nullable()->after('estate_name');
            $table->string('thumb')->nullable()->after('file_path');
            $table->boolean('readed')->default(false)->after('completed_form');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('briefs', function (Blueprint $table) {
            $table->dropColumn('thumb');
            $table->dropColumn('readed');
            $table->dropColumn('origin_name_file');
        });
    }
}
