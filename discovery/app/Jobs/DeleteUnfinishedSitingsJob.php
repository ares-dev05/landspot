<?php

namespace App\Jobs;

use App\Models\Sitings\Siting;
use Illuminate\Bus\Queueable;
use Illuminate\Database\Eloquent\{Builder, Collection};
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class DeleteUnfinishedSitingsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        Siting::where(function (Builder $b) {
                $b->byStatus(Siting::STATUS_IN_PROGRESS)
                    ->where($b->qualifyColumn('updated_at'), '<=', now()->subWeek(1)->startOfDay()->timestamp);
        })
            ->chunk(20, function (Collection $sitings) {
                $sitings->each(function (Siting $siting) {
                    $siting->delete();
                });
            });
    }
}
