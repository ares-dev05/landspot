<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddDepositLotStatus extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        \DB::statement('ALTER TABLE `lots` CHANGE `status` `status` enum(\'Available\',\'Deposit\',\'On Hold\',\'Sold\') DEFAULT NULL;');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        \DB::statement('ALTER TABLE `lots` CHANGE `status` `status` enum(\'Available\',\'On Hold\',\'Sold\') DEFAULT NULL;');
    }
}
