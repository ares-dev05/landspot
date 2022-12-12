<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeLotsTableDimensions extends Migration
{
    public function up()
    {
        \DB::statement('ALTER TABLE `lots` CHANGE `title_date` `title_date` DATE NULL DEFAULT NULL;');
        \DB::statement('UPDATE `lots` SET title_date = NULL WHERE title_date=\'0000-00-00\'');

        \DB::statement(
            "ALTER TABLE `lots` 
                CHANGE `frontage` `frontage` DECIMAL(10,2) NULL DEFAULT NULL,
                CHANGE `depth` `depth` DECIMAL(10,2) NULL DEFAULT NULL"
        );
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
    }
}
