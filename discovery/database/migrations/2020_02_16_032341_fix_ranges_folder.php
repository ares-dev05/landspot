<?php

use App\Models\Range;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Str;

class FixRangesFolder extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Range::where('folder', '')
            ->chunk(20, function (Collection $ranges) {
                $ranges->each(function (Range $range) {
                    $folder = Str::slug($range->name, '_');

                    $duplicates = Range::byCompanyState($range->state_id, $range->cid)
                        ->byFolder($folder)->first();
                    if ($duplicates) {
                        $folder = $folder . "_" . $range->id;
                    }

                    $range->update(compact('folder'));
                });
            });
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
