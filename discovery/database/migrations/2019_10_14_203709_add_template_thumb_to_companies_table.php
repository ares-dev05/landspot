<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddTemplateThumbToCompaniesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('template_thumb', 255)->nullable();
        });

        \DB::statement('UPDATE `companies` SET `template_thumb` = (SELECT template_thumb FROM `sitings_companies` WHERE `sitings_companies`.`sso_company_id` = `companies`.`id`)');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('template_thumb');
        });
    }
}
