<?php

namespace App\Http\Controllers;

use App\Http\Requests\ResetPasswordRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;


class UserProfileController extends Controller
{
    /**
     * @param Request $request
     * @throws \Exception
     * @return array
     */
    function index(Request $request)
    {
        if ($request->expectsJson()) {
            if ($request->has('id')) {
                $user = User::findOrFail($request->get('id'));
                $this->authorize('viewProfile', $user);
            } else {
                $user = \auth()->user();
            }

            return $this->_sendResponse($user);
        }

        return view('user.spa', ['rootID' => 'user-profile']);
    }

    /**
     *
     * @param  ResetPasswordRequest $request
     * @param  User $user
     * @return array
     * @throws \Exception
     */
    public function changePassword(ResetPasswordRequest $request, User $user)
    {
        $this->authorize('updateProfile', $user);

        if (
            Hash::check($request->get('old_password'), $user->password) ||
            Auth::guard('globalAdmin')->check()
        ) {
            $user->update(['password' => bcrypt($request->password)]);

            return ['ajaxSuccess' => 'Password was changed'];
        }

        return ['ajaxError' => 'Please enter correct current password'];
    }

    /**
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    function update(Request $request)
    {
        /** @var User $user */
        $user  = \auth()->user();
        $rules = [];

        if ($request->has('email')) {
            $rules['email'] = [
                'required', 'email', 'max:255', ['unique_email', $user]
            ];
        }

        if ($request->has('display_name')) {
            $rules['display_name'] = 'required|string|max:255';
        }

        $hasPhone = $request->has('phone');

        if ($hasPhone) {
            $rules['phone'] = [
                'required', 'min:3', 'max:20', 'unique_phone:' . $user->id
            ];
        }

        $this->validate($request, $rules);

        if ($hasPhone && !$user->getCanChangePhoneAttribute()) {
            return ['ajaxError' => 'You have recently changed the phone number.'];
        }

        if ($hasPhone) {
            $phone = User::filterPhoneNumber($request->get('phone'));
            $user->sendAuthorizationCode(
                'is the code to authorize you new phone at Landconnect. Never tell anyone this code.',
                $phone
            );
            $user->storeNewPhoneNumber($phone);
            $user->blockPhoneRequestChange();

            return $this->_sendResponse($user);
        }

        $user->update($request->only(['display_name', 'email']));

        $ajaxSuccess = 'Account details were updated';

        return $this->_sendResponse($user, compact('ajaxSuccess'));
    }

    protected function _sendResponse(User $userModel, $messages = [])
    {
        $userModel->append('CAN_CHANGE_PHONE', 'PHONE_AUTHORIZATION_STEP', 'NEW_PHONE_NUMBER');
        $user = $userModel->toArray();
        if (isset($user['phone'])) {
            $user['phone'] = preg_replace('/^(.{3}).+(.{2})$/', '$1*****$2', $user['phone']);
        }

        return array_merge(
            compact('user'),
            $messages
        );
    }

    /**
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    function changePhone(Request $request)
    {
        /** @var User $user */
        $user  = \auth()->user();
        $phone = $user->getNewPhoneNumber();
        $this->validate($request, [
            'code' => ['required', function ($attribute, $value, $fail) use ($user, $request) {
                if (!$user->verifyAuthorizationCode($value, 600)) {
                    $fail('Invalid code, please try again.');
                }
            }]
        ]);

        if ($phone) {
            $user->update(['phone' => $phone]);
            $user->blockNextPhoneChange();

            $ajaxSuccess = 'The phone was updated.';

            return $this->_sendResponse($user, compact('ajaxSuccess'));
        }

        $ajaxError = 'Unable to change the phone. Please try again';

        return $this->_sendResponse($user, compact('ajaxError'));
    }

    /**
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    function authorizeUser(Request $request)
    {
        $password  = $request->get('password');
        $recaptcha = $request->get('recaptchaAnswer');

        /** @var User $user */
        $user  = \auth()->user();
        $rules = [];

        if ($password != '') {
            if ($user->failedAuthorizationAttempts() >= 3) {
                return [
                    'CAPTCHA_REQUIRED'  => true,
                    'RECAPTCHA_SITEKEY' => config('recaptcha.public_key')
                ];
            }

            $rules['password'] = [
                'required', 'min:1', 'max:100', function ($attribute, $value, $fail) use ($password, $user) {
                    if (!Hash::check($password, $user->password)) {
                        $user->incFailedAuthorizationAttempts();
                        $fail('The password is invalid.');
                    }
                }
            ];
        }

        if ($recaptcha) {
            $rules['recaptchaAnswer'] = ['recaptcha'];
        }

        if (!$rules) {
            throw new BadRequestHttpException();
        }

        $this->validate($request, $rules);
        $user->resetFailedAuthorizationAttempts();
        $user->authorizeAccessToSecureSection();

        return [
            'CAPTCHA_REQUIRED'    => false,
            'PASSWORD_AUTHORIZED' => $password != ''
        ];
    }

    /**
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    function get2FAKey(Request $request)
    {
        /** @var User $user */
        $user = \auth()->user();
        if (!$user->hasAccessToSecureSection()) {
            return [
                'PASSWORD_AUTHORIZED' => false
            ];
        }

        $TWOFA_ACTIVE = $user->twofa_secret != '';

        $renewKey = $request->get('renew_key') != '' || !$TWOFA_ACTIVE;
        $user->deleteOTPTempSecret();
        $result = $user->generateQRCodeFromSecret($renewKey);

        return array_merge($result, compact('TWOFA_ACTIVE'));
    }

    /**
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    function verifyOTP(Request $request)
    {
        /** @var User $user */
        $user = \auth()->user();

        $PASSWORD_AUTHORIZED = $user->hasAccessToSecureSection();
        $SECRET_KEY          = '';
        $QRCODE              = '';
        $TEMP_SECRET_KEY     = '';
        $TEMP_QRCODE         = '';
        $OTP_CODE_INVALID    = false;
        $TWOFA_ACTIVE = false;

        $tempSecret = $user->getOTPTempSecret();

        $vars = [
            'SECRET_KEY',
            'QRCODE',
            'TEMP_SECRET_KEY',
            'TEMP_QRCODE',
            'OTP_CODE_INVALID',
            'TWOFA_ACTIVE'
        ];

        if (!$PASSWORD_AUTHORIZED || !$tempSecret) {
            return compact($vars);
        }

        $this->validate($request, [
            'code' => 'required|string|size:6'
        ]);

        $OTP_CODE_INVALID = !$user->verifyOTPCode($tempSecret, $request->get('code'));

        if (!$OTP_CODE_INVALID) {
            $user->update(['twofa_secret' => $tempSecret]);
            $user->deleteOTPTempSecret();
            $TWOFA_ACTIVE = true;
        }

        extract($user->generateQRCodeFromSecret());

        return compact($vars);
    }

    function acceptTOS()
    {
        if (!\request()->expectsJson()) {
            return redirect('/');
        }
        /** @var User $user */
        $user = \auth()->user();
        $user->update(['accepted_tos' => true]);
        $user->setVisible(['id']);
        $tosText = null;

        return compact('user', 'tosText');
    }
}
