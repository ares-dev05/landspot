<?php

namespace App\Http\Controllers;

use App\Http\Requests\ResetPasswordRequest;
use App\Models\User;
use App\Models\UserGroup;
use Illuminate\Http\Request;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;

class UserController extends Controller
{
    function resetInvitationPassword()
    {
        return view('auth.passwords.confirmation');
    }

    function reset(ResetPasswordRequest $request)
    {
        $user = \UserGuardHelper::checkAuthGuards(true);

        $user->update([
            'password'              => password_hash($request->password, PASSWORD_DEFAULT),
            'last_sign_in_stamp'    => time(),
            'verified'              => 1,
        ]);

        return redirect($user->getBaseRoute());
    }

    function membership(Request $request)
    {
        $data = [
            'name'      => $request->name,
            'email'     => $request->email
        ];

        Mail::send(
            'emails.membership',
            $data,
            function (Message $msg) {

                $msg->from(config('mail.from.address'), config('mail.from.name'))
                    ->to('support@landspot.com.au')
                    ->subject('Register a new membership');
            }
        );

        return redirect('/');
    }


    public function verifyEmail(Request $request)
    {
        $user = User::where('verify_token', $request['token'])->first();

        if (!$user) {
            return redirect('login')->with('status', 'Token does not exist or your email is already verified');
        }

        if ($user->verified == 0) {
            $user->verified = 1;
            $user->verify_token = null;
            $user->save();

            return redirect('login')->with('status', 'Your email has been verified');
        }

    }
}
