<?php

namespace App\Jobs;

use App\Models\{PdfManager};
use Illuminate\Database\Eloquent\{Builder as EloquentBuilder};

class SendLotsWithoutPackagesNotificationEmailToPDFManagerJob extends SendLotsWithoutPackagesNotificationEmailToBuilderAdminJob
{
    protected $estateRelation = 'estatePDF';
    /**
     * @return mixed
     */
    protected function usersQuery()
    {
        return PdfManager::where(function (EloquentBuilder $b) {
            $b->where(function (EloquentBuilder $b) {
                $b->where('disabled_estates_access', 0)
                    ->whereHas('company', function (EloquentBuilder $b) {
                        $b->where([
                            'chas_footprints'     => 1,
                            'chas_estates_access' => 1,
                            'type'                => 'builder',
                        ]);
                    });
            })->orWhereHas('company', function (EloquentBuilder $b) {
                $b->where([
                    'chas_footprints' => 0,
                    'type'            => 'builder',
                ]);
            });
        })->notBuilderAdmin()
          ->hasEnabledEmailNotifications();
    }
}
