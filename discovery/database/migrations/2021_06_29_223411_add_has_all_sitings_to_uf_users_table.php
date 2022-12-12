<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddHasAllSitingsToUfUsersTable extends Migration
{ /**
 * Run the migrations.
 *
 * @return void
 */
    public function up()
    {
        Schema::table('uf_users', function (Blueprint $table) {
            $table->boolean('has_all_sitings')->default(false)->after('has_multihouse')->comment('Gives permission to the user to see all sitings of his company on the My Clients page');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('uf_users', function (Blueprint $table) {
            $table->dropColumn('has_all_sitings');
        });
    }
}
