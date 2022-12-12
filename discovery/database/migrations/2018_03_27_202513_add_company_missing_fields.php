<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddCompanyMissingFields extends Migration
{
    const table = 'companies';
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn(self::table, 'ckey')) {
            Schema::table(self::table, function (Blueprint $table) {
                $table->string('ckey', 32)->after('id');
            });
        }

        if (!Schema::hasColumn(self::table, 'folder')) {
            Schema::table(self::table, function (Blueprint $table) {
                $table->string('folder', 32)->after('ckey');
            });
        }

        if (!Schema::hasColumn(self::table, 'use_as_bot')) {
            Schema::table(self::table, function (Blueprint $table) {
                $table->tinyInteger('use_as_bot')->after('domain')->default(0);
            });
        }

        if (!Schema::hasColumn(self::table, 'chas_portal_access')) {
            Schema::table(self::table, function (Blueprint $table) {
                $table->tinyInteger('chas_portal_access')->after('domain')->default(0);
            });
        }

        if (!Schema::hasColumn(self::table, 'chas_envelopes')) {
            Schema::table(self::table, function (Blueprint $table) {
                $table->tinyInteger('chas_envelopes')->after('chas_exclusive')->default(0);
            });
        }
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
