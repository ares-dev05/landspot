<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class AddPdfManagersTable extends Migration
{

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $results = DB::table('permissions')->select('id')->where('name', 'pdf_manager')->first();;
        if ($results) {
            $permId = $results->id;
        } else {
            throw new Exception('Permission pdf_manager not found');
        }

        Schema::create('pdf_managers', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('estate_id')->unsigned();
            $table->integer('manager_id')->unsigned();
            $table->foreign('estate_id')->references('id')->on('estates')->onDelete('cascade');
            $table->foreign('manager_id')->references('id')->on('uf_users')->onDelete('cascade');
            $table->unique(['estate_id', 'manager_id']);
        });

        Schema::table('permissions', function (Blueprint $table) {
            $table->dropColumn('is_land_dev');
            $table->dropColumn('is_builder');
        });

        DB::transaction(function () use ($permId) {
            DB::statement('SELECT id from estate_manager_permissions WHERE permission_id = ? FOR UPDATE', [$permId]);
            DB::statement(
                'INSERT INTO pdf_managers (estate_id, manager_id)
                 (SELECT estate_id, manager_id FROM estate_manager_permissions WHERE permission_id = ?)', [$permId]
            );
            DB::statement(
                'DELETE FROM estate_manager_permissions WHERE permission_id = ?', [$permId]
            );
        });

        DB::statement(
            'DELETE FROM permissions WHERE name = ?', ['pdf_manager']
        );
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->unsignedSmallInteger('is_land_dev')->after('label')->default(0);
            $table->unsignedSmallInteger('is_builder')->after('is_land_dev')->default(0);
        });

        \DB::statement('UPDATE `permissions` SET is_land_dev = 1 WHERE `name`=\'price_editor\' OR `name`=\'list_manager\' OR `name`=\'read_only\'');

        DB::insert('INSERT INTO permissions (name, label, is_land_dev, is_builder) VALUES(?,?,?,?)',
            ['pdf_manager', 'Pdf manager', 0, 1]
        );

        $permId = DB::getPdo()->lastInsertId();

        DB::transaction(function () use ($permId) {
            DB::unprepared(
                "INSERT INTO estate_manager_permissions (estate_id, manager_id, permission_id)
                 (SELECT estate_id, manager_id, ${permId} FROM pdf_managers)"
            );
            DB::unprepared('DELETE FROM pdf_managers');
        });

        Schema::drop('pdf_managers');
    }
}
