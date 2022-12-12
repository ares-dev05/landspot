<?php

use \App\Models\BuyerType;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateBuyerTypesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('buyer_types', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->timestamps();
        });

        $buyerTypes = [
            'First Home Buyer',
            'Downsizer',
            'Upgrader',
            'Investor'
        ];

        foreach ($buyerTypes as $buyerType) {
            BuyerType::create(['name' => $buyerType]);
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('buyer_types');
    }
}
