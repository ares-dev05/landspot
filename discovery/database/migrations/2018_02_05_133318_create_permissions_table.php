<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePermissionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->string('label')->nullable();
        });

        $permissions = new \App\Models\Permission();
        $permissions->create(['name' => 'read_only', 'label' => 'Read only']);
        $permissions->create(['name' => 'list_manager', 'label' => 'List manager']);
        $permissions->create(['name' => 'price_editor', 'label' => 'Price editor']);
        $permissions->create(['name' => 'pdf_manager', 'label' => 'Pdf manager']);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('permissions');
    }
}
