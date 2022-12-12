<?php

namespace App\Http\Controllers\Lotmix\Auth;

use App\Models\{
    InvitedUser, UserInvitedUsers
};

//TODO: deprecated
/**
 * Trait UserInvitationTrait
 */
trait UserInvitationTrait
{

    /**
     * @param InvitedUser $user
     */
    protected function loginUser(InvitedUser $user) {
        $user->userSession()->delete();

        auth()->guard('invitedUser')->loginUsingId($user->id);
        $user->update([
            'last_sign_in_stamp' => time()
        ]);

        request()->session()->regenerate();
    }

    /**
     * @param string $token
     * @return UserInvitedUsers
     */
    protected function getUserInvitation($token)
    {
        $invitationToken = explode('-', $token);
        $invitationToken = array_shift($invitationToken);

        return UserInvitedUsers::byToken($invitationToken)->firstOrFail();
    }

    /**
     * @param InvitedUser $invitedUser
     * @param string $token
     */
    protected function confirmInvitation(InvitedUser $invitedUser, $token)
    {
        /** @var UserInvitedUsers $userInvitation */
        $userInvitation = $this->getUserInvitation($token);

        $userInvitation->update([
            'status' => UserInvitedUsers::STATUS_CLAIMED,
            'invitation_token' => null
        ]);

        if (!$invitedUser->type) {
            $company = $userInvitation->company;
            $invitedUser->update([
                'type' => $company->type
            ]);
        }
    }

    /**
     * @param string $token
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    protected function checkToken($token)
    {
        $appKey = config('app.key');
        $now = time();

        try {
            list($invitationToken, $time, $signature) = explode('-', $token);

            $tokenSignature = substr(md5($invitationToken . ':' . $time . ':' . $appKey), 16);
            if ($tokenSignature === $signature && $now < $time) {
                return $invitationToken;
            }

            throw new \Exception('The invitation token has expired or broken.');
        } catch (\Exception $e) {
            return redirect('/')
                ->with('status', $e->getMessage());
        }
    }

    /**
     * @param InvitedUser $invitedUser
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    protected function checkUserInvitations(InvitedUser $invitedUser)
    {
        $userInvitations = UserInvitedUsers::byInvitedUser($invitedUser->id)
            ->where(function ($query) {
                $query->where('status', UserInvitedUsers::STATUS_CLAIMED)
                    ->orWhere(function ($q) {
                        $q->where('status', UserInvitedUsers::STATUS_BRIEF)
                            ->whereNull('invitation_token');
                    });
            })
            ->withTrashed()->count();

        if ($userInvitations <= 0) {
            if (auth()->guard('invitedUser')->check()) {
                /** @var InvitedUser $user */
                if ($user = auth()->guard('invitedUser')->user()) {
                    $user->userSession()->delete();
                }

                auth()->guard('invitedUser')->logout();
            }

            return redirect('login')->with('status', 'You have not accepted any invitation, check your mail and complete the invitation process');
        }
    }

    /**
     * @param InvitedUser $invitedUser
     */
    protected function acceptPendingInvitations(InvitedUser $invitedUser)
    {
        UserInvitedUsers::byInvitedUser($invitedUser->id)
            ->byStatus(UserInvitedUsers::STATUS_PENDING)
            ->chunk(10, function ($userInvitedUsers) {
                $userInvitedUsers->each(function (UserInvitedUsers $user) {
                    $user->update([
                        'status' => UserInvitedUsers::STATUS_CLAIMED,
                        'invitation_token' => null
                    ]);
                });
            });
    }
}