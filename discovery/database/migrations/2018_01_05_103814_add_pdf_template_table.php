<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddPdfTemplateTable extends Migration
{
    const table = 'pdf_lots_template';
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::dropIfExists('estate_docs');
        Schema::create(self::table, function (Blueprint $table) {
            $table->engine  = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');
            $table->integer('company_id');
            $table->string('header_logo')->nullable();
            $table->string('footer_logo')->nullable();
            $table->mediumText('template_data')->nullable();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists(self::table);
    }
}
