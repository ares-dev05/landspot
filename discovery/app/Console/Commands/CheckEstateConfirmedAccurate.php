<?php

namespace App\Console\Commands;

use App\Models\{
    Company, Estate, User, UserGroup
};
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;

class CheckEstateConfirmedAccurate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'command:check-estate-confirmed-accurate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Checks "confirmed accurate" of the estate and notifies the manager';

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
        $companyEstates = [];
        Estate::where('confirmed_at', '<=', \DB::raw('UNIX_TIMESTAMP() - 86400'))
            ->chunk(10, function ($estates) use (&$companyEstates) {
                $estates->each(function (Estate $estate) use (&$companyEstates) {
                    $companyEstates[$estate->company_id][] = $estate;
                });
            });

        foreach ($companyEstates as $companyId => $estates) {
            $users = Company::findOrFail($companyId)->user;

            $admins = $users->filter(function (User $user) {
                return $user->hasGroup(UserGroup::GroupDeveloperAdmins);
            });

            if ($admins->isNotEmpty()) {
                Mail::send(
                    'emails.estates-confirmed-accurate',
                    [
                        'estates' => $estates
                    ],
                    function (Message $msg) use ($admins) {
                        $msg->from(config('mail.from.address'), config('mail.from.name'))
                            ->subject('Please confirm your price list is accurate');

                        foreach ($admins as $admin) {
                            $msg->to($admin->email, $admin->display_name);
                        }
                    }
                );
            }
        }
    }
}
