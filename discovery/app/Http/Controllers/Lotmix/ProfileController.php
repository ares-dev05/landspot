<?php

namespace App\Http\Controllers\Lotmix;

use App\Http\Controllers\Controller;
use App\Models\GlobalAdmin;
use App\Models\InvitedUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

//TODO: deprecated
class ProfileController extends Controller
{
    function index()
    {
        /** @var InvitedUser|GlobalAdmin $user */
        $user = auth()->user();

        $appends = ['nonce'];
        if (!$user->isGlobalAdmin()) {
            $appends = array_merge($appends, ['displayName', 'isBuilderUser']);

        }
        $user->append($appends);
        $isAdmin = $user->isGlobalAdmin();

        return compact('user', 'isAdmin');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     * @param InvitedUser $user
     * @return \Illuminate\Http\Response
     * @throws \Exception
     */
    public function update(InvitedUser $user, Request $request)
    {
        $this->authorize('updateProfile', $user);

        $this->validate(
            $request,
            [
                'last_name' => 'required|string|max:50',
                'first_name' => 'required|string|max:50',
                'phone' => [
                    'required', 'min:3', 'max:20', 'unique_phone:' . $user->id
                ],
            ]
        );

        $user->update($request->only(['phone', 'first_name', 'last_name']));
        $message = 'The profile was updated';


        return compact('user', 'message');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     * @param InvitedUser $user
     * @return \Illuminate\Http\Response
     * @throws \Exception
     */
    public function changePassword(Request $request, InvitedUser $user)
    {
        $this->authorize('updateProfile', $user);

        $this->validate(
            $request,
            [
                'password' => [
                    'required',
                    'min:8',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/',
                    'confirmed']
            ],
            [
                'password.regex' => 'Password must contain minimum eight characters, at least one number character and both uppercase and lowercase letters.',
            ]
        );

        $current_password = $user->password;
        if (!$user->password || Hash::check($request->old_password, $current_password)) {
            $user->update([
                'password' => bcrypt($request->password),
            ]);

            $message = 'Password changed successfully';

            return compact('user', 'message');
        } else {
            $errors = 'Please enter correct current password';
            throw new \Exception($errors);
        }
    }
}