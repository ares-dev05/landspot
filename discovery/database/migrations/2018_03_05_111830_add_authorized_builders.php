<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddAuthorizedBuilders extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //Move to seeds
        /*DB::table('companies')->insert([
            ['type' => 'builder', 'theme_id' => 0, 'builder_id' => 'Henley', 'name' => 'Henley', 'domain' => 'tribello.com'],
            ['type' => 'builder', 'theme_id' => 0, 'builder_id' => 'Home Buyers Centre Victoria', 'name' => 'Home Buyers Centre Victoria', 'domain' => 'homebuyers.com.au'],
            ['type' => 'builder', 'theme_id' => 0, 'builder_id' => 'GJ Gardner', 'name' => 'GJ Gardner', 'domain' => 'gjgardner.com.au'],
            ['type' => 'builder', 'theme_id' => 0, 'builder_id' => 'Carlisle Homes', 'name' => 'Carlisle Homes', 'domain' => 'carlislehomes.com.au'],
            ['type' => 'builder', 'theme_id' => 0, 'builder_id' => 'Nostra Homes', 'name' => 'Nostra Homes', 'domain' => 'nostrahomes.com.au'],
            ['type' => 'builder', 'theme_id' => 0, 'builder_id' => 'Granvue Homes', 'name' => 'Granvue Homes', 'domain' => 'granvuehomes.com.au'],
            ['type' => 'builder', 'theme_id' => 0, 'builder_id' => 'Fairhaven Homes', 'name' => 'Fairhaven Homes', 'domain' => 'fairhavenhomes.com.au'],
            ['type' => 'builder', 'theme_id' => 0, 'builder_id' => 'Metricon Homes', 'name' => 'Metricon Homes', 'domain' => 'huntinghandmade.com'],
            ['type' => 'builder', 'theme_id' => 0, 'builder_id' => 'JG King', 'name' => 'JG King', 'domain' => 'jgkinghomes.com.au'],
            ['type' => 'builder', 'theme_id' => 0, 'builder_id' => 'Hotondo Homes', 'name' => 'Hotondo Homes', 'domain' => 'hotondo.com.au'],
            ['type' => 'builder', 'theme_id' => 0, 'builder_id' => 'Zuccala Homes', 'name' => 'Zuccala Homes', 'domain' => 'zuccalahomes.com.au'],
            ['type' => 'builder', 'theme_id' => 0, 'builder_id' => 'Boutique Homes', 'name' => 'Boutique Homes', 'domain' => 'boutiquehomes.com.au'],
            ['type' => 'builder', 'theme_id' => 0, 'builder_id' => 'Cavalier Homes', 'name' => 'Cavalier Homes', 'domain' => 'cavalierhomes.com.au']
        ]);*/
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
