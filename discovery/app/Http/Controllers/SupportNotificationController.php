<?php

namespace App\Http\Controllers;

use App\Http\Requests\SupportNotificationRequest;
use App\Models\User;

class SupportNotificationController extends Controller
{
    /**
     * Update the specified resource in storage.
     *
     * @param  SupportNotificationRequest $request
     * @param  \App\Models\User $user
     * @return \Illuminate\Http\Response
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function update(SupportNotificationRequest $request, User $user)
    {
        if (!\request()->expectsJson()) {
            return redirect()->route('/');
        }

        $this->authorize('updateProfile', $user);

        $type = $request->type;
        $message = [];

        switch ($type) {
            case 'accept':
                $user->update(['is_grant_support_access' => 1]);
                $user->supportRequests()->detach($user);
                $message['success'] = 'Support request confirmed';
                break;

            case 'abort':
                $user->supportRequests()->detach($user);
                $message['success'] = 'Support request declined';
                break;

            case 'close':
                $user->closedSupportSessions()->detach($user);
                break;
        }

        $supportRequest       = $user->supportRequests->contains($user);
        $closedSupportSession = $user->closedSupportSessions->contains($user);
        $userNotifications    = $user->userNotification()->unread()->get();
        $user = $user->only('id');


        return compact('user', 'supportRequest', 'message', 'closedSupportSession', 'userNotifications');
    }
}
