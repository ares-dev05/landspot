<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\DB;

class CleanExpiredDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        DB::unprepared('DELETE FROM cache WHERE expiration <= UNIX_TIMESTAMP()');
        DB::unprepared('DELETE FROM sessions WHERE last_activity < UNIX_TIMESTAMP() - 259200');
        DB::unprepared('DELETE FROM  oauth_access_tokens WHERE expires_at <= NOW()');
        DB::unprepared('DELETE FROM  oauth_auth_codes WHERE expires_at <= NOW()');
        DB::unprepared('DELETE FROM  oauth_refresh_tokens WHERE expires_at <= NOW()');
    }
}
