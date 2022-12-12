<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddTitleDate extends Migration
{
    const table = 'lots';

    public function up()
    {
        Schema::table(self::table, function (Blueprint $table) {
            $table->date('title_date')->after('price');
        });

        Schema::table('lot_attributes', function (Blueprint $table) {
            $table->dropColumn('is_currency');
        });

        $estates = \App\Models\Estate::get(['id']);
        $staticColumns = \App\Models\Estate::staticLotColumns;
        $order = 0;
        foreach ($staticColumns as &$c) {
            $c = $order++;
        }

        foreach ($estates as $estate) {
            if ($estate->lotAttributes()->where('attr_name', 'title_date')->get()->isEmpty()) {
                $estate->lotAttributes()->create([
                    'attr_name'    => 'title_date',
                    'display_name' => \App\Models\Estate::staticLotColumns['title_date'],
                    'order'        => 0,
                    'column_type'  => 'static'
                ]);
            }
            $order = count($staticColumns);
            foreach ($estate->lotAttributes as $column) {
                if (array_key_exists($column->attr_name, $staticColumns)) {
                    $column->order = $staticColumns[$column->attr_name];
                } else {
                    $column->order = $order++;
                }
                $column->save();
            };
        }
        \App\Models\LotAttributes
            ::where('display_name', 'Street Name')
            ->update(['display_name' => 'Street']);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table(self::table, function (Blueprint $table) {
            $table->dropColumn('title_date');
        });

        Schema::table('lot_attributes', function (Blueprint $table) {
            $table->integer('is_currency')->unsigned()->default(0)->after('color');
        });
    }
}
