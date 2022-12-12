<?php

namespace App\Jobs;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class DisableUserJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    const DAYS = 145;

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
		return;
        $maxTimestamp = Carbon::now()->subDays(self::DAYS)->timestamp;
        User::query()
            ->where('last_sign_in_stamp', '<', $maxTimestamp)
            ->withoutGlobalScopes()
            ->update(['enabled' => 0]);
    }
}
