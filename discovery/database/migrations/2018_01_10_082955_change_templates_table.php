<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeTemplatesTable extends Migration
{
    const table = 'pdf_lots_template';

    public function up()
    {
        Schema::disableForeignKeyConstraints();
        Schema::table(self::table, function (Blueprint $table) {
            $table->dropForeign('pdf_lots_template_company_id_foreign');
            $table->integer('estate_id')->unsigned()->after('id');
            $table->foreign('estate_id')->references('id')->on('estates')->onDelete('restrict');
            $table->dropColumn('company_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::disableForeignKeyConstraints();
        Schema::table(self::table, function (Blueprint $table) {
            $table->integer('company_id');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('restrict');
            $table->dropForeign('pdf_lots_template_estate_id_foreign');
            $table->dropColumn('estate_id');
        });
    }
}
