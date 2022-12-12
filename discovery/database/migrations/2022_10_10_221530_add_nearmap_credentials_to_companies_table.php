<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddNearmapCredentialsToCompaniesTable extends Migration
{
    const table = 'companies';

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table(self::table, function (Blueprint $table) {
            $table->tinyInteger('chas_nearmap')->after('chas_estates_access')->default(0);
            $table->string('nearmap_api_key', 128)->nullable();
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
            $table->dropColumn('chas_nearmap');
            $table->dropColumn('nearmap_api_key');
        });
    }
}
