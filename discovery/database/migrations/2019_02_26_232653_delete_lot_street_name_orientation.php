<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class DeleteLotStreetNameOrientation extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        \DB::table('lot_attributes')
            ->where('column_type', 'static')
            ->where(function (\Illuminate\Database\Query\Builder $b) {
                $b->where('attr_name', 'street')
                    ->orWhere('attr_name', 'orientation');
            })->delete();

        Schema::table('lots', function (Blueprint $table) {
            $table->dropColumn(['street', 'orientation']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('lots', function (Blueprint $table) {
            $table->string('orientation')->nullable();
            $table->string('street')->nullable();
        });
    }
}
