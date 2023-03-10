<?php

namespace App\Console\Commands;

use App\Models\Sitings\Floorplan;
use Illuminate\Console\Command;

class RepairFloorplanUpdatedAt extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'plan:updated';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fixes for house_svgs entities updated_at column (from 0000-00-00 00:00:00 to created_at date)';

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
        Floorplan::where('updated_at', 'like', '%0000-00-00 00:00:00%')->each(function ($plan) {
            $plan->updated_at = $plan->created_at;
            $plan->save();
        });
        $this->info('plans updated_at column updated');
    }
}
