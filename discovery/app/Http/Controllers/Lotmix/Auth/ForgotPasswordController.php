<?php

namespace App\Http\Controllers\Lotmix\Auth;

use App\Http\Controllers\Controller;
use App\Models\InvitedUser;
use App\Models\UserInvitedUsers;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Foundation\Auth\SendsPasswordResetEmails;

//TODO: deprecated
class ForgotPasswordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset emails and
    | includes a trait which assists in sending these notifications from
    | your application to your users. Feel free to explore this trait.
    |
    */

    use SendsPasswordResetEmails;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
    }

    /**
     * Send a reset link to the given user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function sendResetLinkEmail(Request $request)
    {
        $this->validateEmail($request);

        try {
            $user = InvitedUser::findByEmail($request->email);
        } catch (ModelNotFoundException $e) {
            return back()->withErrors(['email' => 'Account with such email doesn\'t exists.']);
        }

        $userInvitations = UserInvitedUsers::byInvitedUser($user->id)
            ->where(function ($query) {
                $query->where('status', UserInvitedUsers::STATUS_CLAIMED)
                    ->orWhere(function ($q) {
                        $q->where('status', UserInvitedUsers::STATUS_BRIEF)
                            ->whereNull('invitation_token');
                    });
            })
            ->withTrashed()->count();

        if ($userInvitations <= 0) {
            return back()->withErrors(['email' => 'Confirm registration by going to the link in the letter that we sent you to the mail.']);
        }

        // We will send the password reset link to this user. Once we have attempted
        // to send the link, we will examine the response then see the message we
        // need to show to the user. Finally, we'll send out a proper response.
        $response = $this->broker()->sendResetLink(
            $request->only('email')
        );

        return $response == Password::RESET_LINK_SENT
            ? $this->sendResetLinkResponse($request, $response)
            : $this->sendResetLinkFailedResponse($request, $response);
    }

    /**
     * Display the form to request a password reset link.
     *
     * @return \Illuminate\Http\Response
     */
    public function showLinkRequestForm()
    {
        if ($user = \UserGuardHelper::checkAuthGuards(true)) {
            return redirect($user->getBaseRoute());
        }

        return view('lotmix.auth.passwords.email');
    }

    /**
     * Get the broker to be used during password reset.
     *
     * @return \Illuminate\Contracts\Auth\PasswordBroker
     */
    public function broker()
    {
        return Password::broker('invitedUsers');
    }
}
