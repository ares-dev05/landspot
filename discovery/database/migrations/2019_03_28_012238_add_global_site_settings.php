<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddGlobalSiteSettings extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('global_site_settings', function (Blueprint $table) {
            $table->increments('id');
            $table->string('type', 32);
            $table->text('value');
            $table->unique('type');
        });

        \DB::table('global_site_settings')->insert([
            'type'  => \App\Models\GlobalSiteSettings::settingsJobEmailNotifications,
            'value' => '1'
        ]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('global_site_settings');
    }
}
