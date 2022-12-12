<?php

namespace App\Jobs;

use App\Services\DrawerThemeRebuilder\DrawerThemeRebuilder;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class DrawerThemeRebuildJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $themeId;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($themeId)
    {
         $this->themeId = $themeId;
    }

    /**
     * Execute the job.
     *
     * @return void
     * @throws \Exception
     */
    public function handle()
    {
        $rebuilder = new DrawerThemeRebuilder($this->themeId);
        $rebuilder->rebuild();
    }
}
