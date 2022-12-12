<?php

namespace App\Http\Controllers;

use mysql_xdevapi\Exception;
use App\Models\{
    Permission, User, UserNotification, Estate
};

class UserNotificationController extends Controller
{
    /**
     * @return array|\Illuminate\Http\RedirectResponse
     * @throws \Throwable
     */
    function index()
    {
        if (!\request()->expectsJson()) {
            return redirect()->route('/');
        }

        $user = User::find(auth()->user()->id);

        $this->authorize('updateProfile', $user);

        if (!$user->can('estates-access')) {
            $supportRequest       = false;
            $tosText              = null;
            $closedSupportSession = false;
        } else {
            $tosText              = $user->accepted_tos || $user->cannot('estates-access')
                ? null
                : view('landspot.tos-popup-text')->render();
            $supportRequest       = $user->supportRequests->contains($user);
            $closedSupportSession = $user->closedSupportSessions->contains($user);
        }

        $userNotifications    = $user->userNotification()->unread()->get();

        $user->setVisible(['id']);

        return compact('user', 'supportRequest', 'closedSupportSession', 'userNotifications', 'tosText');
    }

    /**
     * @param UserNotification $userNotification
     * @return array
     * @throws \Exception
     */
    function closeNotification(UserNotification $userNotification)
    {
        $user = User::find(auth()->user()->id);
        $this->authorize('updateProfile', $user);

        $userNotification->update(['read_at' => time()]);

        $userNotifications = $user->userNotification()->unread()->get();

        return compact('userNotifications');
    }

    function getBrowserNotificationChannels()
    {
        /** @var User $user */
        $user = auth()->user();
        $estateChannels = [];
        if ($user->can('estates-access')) {
            $estateIds = $user->estate()->get(['estates.id']);

            $estateChannels = $estateIds->reduce(function ($acc, $estate) use ($user) {
                /** @var Estate $estate */
                $estateUserChannels = [
                    $estate->getBrowserNotificationChannel()
                ];
                $pdfManager = !$estate->getPdfManagersCount($user->company_id) ||
                    $estate->pdfManagers()->byId($user->id)->exists();

                if ($user->company->isBuilder()) {
                    $estateUserChannels[] = $estate->getBrowserNotificationChannel('builder-');
                }

                if ($pdfManager || $user->isBuilderAdmin()) {
                    $estateUserChannels[] = $estate->getBrowserNotificationChannel('pdf-managers-');
                }

                $acc = $acc->concat($estateUserChannels);
                return $acc;
            }, collect([]));
            $estateChannels->push($user->getBrowserNotificationChannel());
        }
        $CHANNELS_UPDATED = true;

        return compact('estateChannels', 'CHANNELS_UPDATED');
    }
}
