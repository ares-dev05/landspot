<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeLots extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::disableForeignKeyConstraints();
        DB::statement('ALTER TABLE `lots` CHANGE `price` `price` INT UNSIGNED NULL DEFAULT NULL');
        DB::statement("ALTER TABLE `lots` CHANGE `status` `status` ENUM('Available','On Hold','Sold') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL");
        DB::statement("ALTER TABLE `estate_managers` DROP FOREIGN KEY `estate_managers_estate_id_foreign`");
        DB::statement("ALTER TABLE `estate_managers` ADD CONSTRAINT `estate_managers_estate_id_foreign` FOREIGN KEY (`estate_id`) REFERENCES `estates`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT");
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
