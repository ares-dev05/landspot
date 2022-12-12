<?php

namespace App\Console\Commands;

use App\Models\Range;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class DeleteTrashedRanges extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'command:delete-trashed-ranges';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Permanently Deleting Trashed Ranges';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        Carbon::useMonthsOverflow(false);
        Range::onlyTrashed()
            ->where('deleted_at', '<=', now()->subMonth(1)->startOfDay())
            ->chunk(10, function ($ranges) {
                $ranges->each(function (Range $r) {
                    $r->forceDelete();
                });
            });
    }
}
