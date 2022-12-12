<?php

namespace App\Console\Commands;

use App\Models\House;
use Illuminate\Console\Command;

class MigrateHouses extends Command
{
    /**
     * Migrate houses from svgs table
     *
     * @var string
     */
    protected $signature = 'command:manage_houses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Add new houses from SVG, delete removed houses from SVG, update houses from SVG';

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        House::jobManageHouses();
    }
}
