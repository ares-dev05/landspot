<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeBathColumnInHouseAttributesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        \DB::unprepared("ALTER TABLE `house_attributes` CHANGE `bathrooms` `bathrooms` DOUBLE(8,2) UNSIGNED NULL DEFAULT NULL;");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('house_attributes', function (Blueprint $table) {
            $table->unsignedInteger('bathrooms')->nullable()->change();
        });
    }
}
