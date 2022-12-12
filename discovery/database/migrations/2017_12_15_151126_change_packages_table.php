<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangePackagesTable extends Migration
{
    public function up()
    {
        Schema::table('lot_packages', function (Blueprint $table) {
            $table->string('name');
            $table->string('thumb')->nullable();
            $table->integer('company_id');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
        });

        Schema::table('lots', function (Blueprint $table) {
            $table->dropColumn('packages');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('lot_packages', function (Blueprint $table) {
            $table->dropForeign('lot_packages_company_id_foreign');
            $table->dropColumn('name', 'thumb', 'company_id');
        });

        Schema::table('lots', function (Blueprint $table) {
            $table->unsignedInteger('packages')->default(0);
        });
    }
}
