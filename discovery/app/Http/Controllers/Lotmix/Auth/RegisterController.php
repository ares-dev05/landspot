<?php

namespace App\Http\Controllers\Lotmix\Auth;

use App\Http\Controllers\Controller;
use App\Models\InvitedUser;
use App\Models\UserInvitedUsers;
use Illuminate\Foundation\Auth\RegistersUsers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{
    Auth, Hash, Validator
};

//TODO: deprecated
class RegisterController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Register Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users as well as their
    | validation and creation. By default this controller uses a trait to
    | provide this functionality without requiring any additional code.
    |
    */

    use RegistersUsers, UserInvitationTrait;

    /**
     * Where to redirect users after registration.
     *
     * @var string
     */
    protected $redirectTo = '/home';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
        $this->middleware('throttle:10,10', ['only' => ['register']]);
    }

    /**
     * Show the application registration form.
     *
     * @param  \Illuminate\Http\Request $request
     * @param string $token
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function showRegistrationForm(Request $request, $token)
    {
        /** @var UserInvitedUsers $userInvitation */
        $userInvitation = $this->getUserInvitation($token);
        return view('lotmix.auth.register', compact('token', 'userInvitation'));
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        return Validator::make($data, [
            'first_name'    => 'string|max:50|required',
            'last_name'     => 'string|max:50|required',
            'email'         => 'required|string|email|max:150|exists:invited_users',
//            'phone'         => 'sometimes|required|digits_between:6,20',
            'tos'           => 'accepted',
            'notification'     => 'accepted|sometimes',
            'password'      => [
                'required',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/',
                'confirmed'
            ]
        ], [
//            'phone.digits_between' => 'The phone number must be a number between 6 and 20 digits long.',
            'password.regex' => 'Password must contain minimum eight characters, at least one number character and both uppercase and lowercase letters.',
        ]);
    }

    /**
     * Handle a registration request for the application.
     *
     * @param  Request $request
     * @param string $token
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    public function register(Request $request, $token)
    {
        $data = $this->validator($request->all())->validate();
        $invitedUser = InvitedUser::byEmail($data['email'])->firstOrFail();

        $invitedUser->update([
            'first_name'   => $data['first_name'],
            'last_name'    => $data['last_name'],
            'accepted_tos' => $data['tos'],
            'notify'       => $data['notification'] ?? 0,
//            'phone'        => $data['phone'],
            'password'     => Hash::make($data['password']),
        ]);

        $this->confirmInvitation($invitedUser, $token);
        $this->acceptPendingInvitations($invitedUser);
        $this->loginUser($invitedUser);

        return redirect($invitedUser->getBaseRoute());
    }

    /**
     * Get the guard to be used during authentication.
     *
     * @param string $guard
     * @return \Illuminate\Contracts\Auth\StatefulGuard
     */
    protected function guard($guard = null)
    {
        return Auth::guard($guard);
    }

    protected function throttleKey(Request $request)
    {
        return 'register|' . $request->ip();
    }
}
