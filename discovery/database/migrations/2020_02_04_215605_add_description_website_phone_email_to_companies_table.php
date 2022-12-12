<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddDescriptionWebsitePhoneEmailToCompaniesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->text('description')->nullable();
            $table->string('website', 160)->nullable();
            $table->string('email', 160)->nullable();
            $table->string('phone',20)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('description');
            $table->dropColumn('website');
            $table->dropColumn('email');
            $table->dropColumn('phone');
        });
    }
}
