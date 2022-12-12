<?php

use App\Models\{
    Company, LotmixStateSettings
};
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddLotmixVisibilityForBuilders extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->unsignedTinyInteger('chas_lotmix')->default(Company::LOTMIX_ACCESS_DISABLED);
        });

        Schema::create('lotmix_state_settings', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->increments('id');
            $table->integer('company_id');
            $table->integer('state_id');
            $table->unsignedTinyInteger('value')->default(LotmixStateSettings::SAVE_AND_EXPORT);

            $table->foreign('state_id')->references('id')->on('house_states')->onDelete('cascade');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->unique(['company_id', 'state_id']);
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
            $table->dropColumn('chas_lotmix');
        });
        Schema::dropIfExists('lotmix_state_settings');
    }
}
