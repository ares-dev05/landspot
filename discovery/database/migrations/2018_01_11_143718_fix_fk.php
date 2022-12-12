<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class FixFk extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::unprepared(
        'ALTER TABLE `lot_packages` DROP FOREIGN KEY `lot_packages_company_id_foreign`;
         ALTER TABLE `lot_packages` ADD CONSTRAINT `lot_packages_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
                  
         ALTER TABLE `lot_packages` DROP FOREIGN KEY `lot_packages_lot_id_foreign`;
         ALTER TABLE `lot_packages` ADD CONSTRAINT `lot_packages_lot_id_foreign` FOREIGN KEY (`lot_id`) REFERENCES `lots`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
         
         ALTER TABLE `facades` DROP FOREIGN KEY `facades_house_id_foreign`;
         ALTER TABLE `facades` ADD CONSTRAINT `facades_house_id_foreign` FOREIGN KEY (`house_id`) REFERENCES `houses`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
         
         ALTER TABLE `floorplans` DROP FOREIGN KEY `floorplans_house_id_foreign`;
         ALTER TABLE `floorplans` ADD CONSTRAINT `floorplans_house_id_foreign` FOREIGN KEY (`house_id`) REFERENCES `houses`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
         
         ALTER TABLE `galleries` DROP FOREIGN KEY `galleries_house_id_foreign`;
         ALTER TABLE `galleries` ADD CONSTRAINT `galleries_house_id_foreign` FOREIGN KEY (`house_id`) REFERENCES `houses`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
         
         ALTER TABLE `houses` DROP FOREIGN KEY `houses_range_id_foreign`;
         ALTER TABLE `houses` ADD CONSTRAINT `houses_range_id_foreign` FOREIGN KEY (`range_id`) REFERENCES `ranges`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
         
         ALTER TABLE `house_ranges` DROP FOREIGN KEY `house_ranges_ibfk_1`;
         ALTER TABLE `house_ranges` ADD CONSTRAINT `house_ranges_ibfk_1` FOREIGN KEY (`cid`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
         
         ALTER TABLE `lots` DROP FOREIGN KEY `lots_stage_id_foreign`;         
         ALTER TABLE `lots` ADD CONSTRAINT `lots_stage_id_foreign` FOREIGN KEY (`stage_id`) REFERENCES `stages`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
         
         ALTER TABLE `options` DROP FOREIGN KEY `options_house_id_foreign`;
         ALTER TABLE `options` ADD CONSTRAINT `options_house_id_foreign` FOREIGN KEY (`house_id`) REFERENCES `houses`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
         
         ALTER TABLE `pdf_lots_template` DROP FOREIGN KEY `pdf_lots_template_estate_id_foreign`;
         ALTER TABLE `pdf_lots_template` ADD CONSTRAINT `pdf_lots_template_estate_id_foreign` FOREIGN KEY (`estate_id`) REFERENCES `estates`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
         
         ALTER TABLE `stages` DROP FOREIGN KEY `stages_estate_id_foreign`;
         ALTER TABLE `stages` ADD CONSTRAINT `stages_estate_id_foreign` FOREIGN KEY (`estate_id`) REFERENCES `estates`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
         
         ALTER TABLE `stage_docs` DROP FOREIGN KEY `stage_docs_stage_id_foreign`;
         ALTER TABLE `stage_docs` ADD CONSTRAINT `stage_docs_stage_id_foreign` FOREIGN KEY (`stage_id`) REFERENCES `stages`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
         ');
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
