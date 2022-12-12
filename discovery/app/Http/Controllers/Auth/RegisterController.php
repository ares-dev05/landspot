<?php

namespace App\Http\Controllers\Auth;

use App\Events\LandspotUserRegistered;
use App\Http\Controllers\Controller;
use App\Http\Requests\PreRegisterRequest;
use App\Models\State;
use App\Models\User;
use Illuminate\Foundation\Auth\RegistersUsers;
use Illuminate\Http\Request;
use Illuminate\Support\{Str};
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

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

    use RegistersUsers, UserGuardTrait;

    /**
     * Where to redirect users after registration.
     *
     * @var string
     */
    protected $redirectTo = '/landspot/my-estates';

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
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Contracts\Foundation\Application|\Illuminate\Http\RedirectResponse|\Illuminate\Http\Response|\Illuminate\Routing\Redirector
     */
    public function showRegistrationForm(Request $request)
    {
        if ($user = \UserGuardHelper::checkAuthGuards(true)) {
            return redirect($user->getBaseRoute());
        }

        $states    = State::all(['id', 'name']);
        $type = 'builder';
        if ($request['type']) {
            $type = $request['type'];
        }

        return view('auth.register', compact('type', 'states'));
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function builderValidator(array $data)
    {
        return Validator::make($data, [
            'type' => 'required|string|max:15',
            'company_name' => 'required|string|max:50',
            'display_name' => 'required|string|max:50',
            'email' => 'required|string|email|max:150|unique:uf_users',
            'state_id' => 'required|numeric|exists:house_states,id',
            'phone' => 'nullable|string|max:20',
            'password' => [
                'required',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/',
                'confirmed'],
        ], [
            'password.regex' => 'Password must contain minimum eight characters, at least one number character and both uppercase and lowercase letters.',
        ]);
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function developerValidator(array $data)
    {
        return Validator::make($data, [
            'type'          => 'required|string|max:15',
            'display_name'  => 'required|string|max:50',
            'email'         => 'required|string|email|max:150|unique:uf_users',
            'phone'         => 'nullable|string|max:20',
            'estate_name'   => 'required|string|max:50',
            'website'       => 'required|string|url|max:50',
            'address'       => 'required|string|max:255',
        ]);
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return \App\Models\User
     */
    protected function createUser(array $data)
    {
        $password = $data['password'] ?? Str::random(12);
        $verify_token = Str::random(30);
        $requiredAttributes = [
            'display_name'            => $data['display_name'],
            'user_name'               => $data['display_name'],
            'email'                   => $data['email'],
            'phone'                   => $data['phone'],
            'password'                => password_hash($password, PASSWORD_DEFAULT),
            'company_id'              => isset($data['company_id']) ? $data['company_id'] : 0,
            'verify_token'            => $verify_token,
            'is_user_manager'         => 0,
            'is_global_estate_manager'=> 0,
            'is_discovery_manager'    => 0,
            'activation_token'        => '',
            'last_activation_request' => 0,
            'lost_password_request'   => 0,
            'active'                  => 1,
            'verified'                => 0,
            'title'                   => '',
            'sign_up_stamp'           => time(),
            'last_sign_in_stamp'      => time(),
            'state_id'                => $data['state_id'],
        ];

        $user = User::make($requiredAttributes);

        return $user;
    }

    /**
     * Handle a registration request for the application.
     *
     * @param  \App\Http\Requests\PreRegisterRequest  $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    public function register(PreRegisterRequest $request)
    {
        $type = $request->type;
        $data = $request->only([
            'type',
            'company_name',
            'display_name',
            'email',
            'state_id',
            'phone',
            'password',
            'password_confirmation',
            'estate_name',
            'website',
            'address'
        ]);

        if ($type == 'builder') {
            $this->builderValidator($data)->validate();
        } elseif ($type == 'developer') {
            $this->developerValidator($data)->validate();
        }

        event(new LandspotUserRegistered($data));
        return redirect('login')->with('status', 'Thank you for registration. We will contact you soon.');
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
