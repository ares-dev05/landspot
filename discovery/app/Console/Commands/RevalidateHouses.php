<?php

namespace App\Console\Commands;

use App\Models\House;
use Illuminate\Console\Command;

class RevalidateHouses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'command:revalidate_houses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove from Discovery incompleted houses';

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        House::jobRemoveIncompletedHousesFromDiscovery();
    }
}
