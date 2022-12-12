<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Trait TwoFactorAuthorizationTrait
 */
trait TwoFactorAuthorizationTrait
{

    function getLoginConfig()
    {
        $brand             = session()->get('brand');
        $forgotPasswordUrl = route($brand ? 'brand.password.request' : 'password.request', $brand ? compact('brand') : []);

        $recaptchaKey = config('recaptcha.public_key');

        return compact('forgotPasswordUrl', 'recaptchaKey');
    }

    /**
     * @param Request $request
     * @param bool $isSso
     * @return mixed
     * @throws \Exception
     */
    protected function validate2FALogin(Request $request, $isSso)
    {
        $tempUserId  = session()->get('2FA-TempLoginId');
        $fingerprint = $request->get('fp');

        if ($tempUserId) {
            $this->_validateOTPLogin($request, $tempUserId);

            $this->loginUser($isSso, $tempUserId);

            if ($fingerprint) {
                auth()->user()->update(['device_fp' => $fingerprint]);
            }
        } else {
            $this->validateLogin($request);

            if ($this->hasTooManyLoginAttempts($request)) {
                return $this->sendLockoutResponse($request);
            }

            if ($this->_attemptOnceLogin($request)) {
                /** @var User $user */
                $user = auth()->user();

                if ($user->device_fp === $fingerprint && $fingerprint) {
                    $this->loginUser($isSso, $user->id);

                    return;
                }

                if ($user->twofa_secret) {
                    session()->put('2FA-TempLoginId', $user->getAuthIdentifier());
                    auth()->logout();

                    return [
                        'OTP_STEP'           => 1,
                        'errors'             => null,
                        'SMS_LOGIN_DISABLED' => !$user->canSendSMSOtpCode()
                    ];

                } else {
                    $this->loginUser($isSso, $user->id);
                }
            } else {
                $this->incrementLoginAttempts($request);

                return $this->sendFailedLoginResponse($request);
            }
        }
    }

    /**
     * @param bool $isSso
     * @param int $userId
     */
    protected function loginUser($isSso, $userId) {
        /** @var User $user */
        $user = User::findOrFail($userId);
        $user->userSession()->delete();

        $user->tokens()->each(function (\Laravel\Passport\Token $token){
            $token->revoke();
        });

        if ($isSso) {
            auth()->loginUsingId($userId);
        } else {
            $guard = $this->getUserGuard(\request(), auth()->user());
            auth()->guard($guard)->loginUsingId(auth()->id());
        }

        request()->session()->regenerate();
    }

    /**
     * @return array
     * @throws \Exception
     */
    function sendSMSForLogin()
    {
        $tempUserId = session()->get('2FA-TempLoginId');

        if (!$tempUserId) {
            throw new AccessDeniedHttpException('Please login first');
        }
        /** @var User $user */

        $user = User::findOrFail($tempUserId);

        if (!$user->phone) {
            throw ValidationException::withMessages([
                'smsOTP' => 'A phone number is missing in your profile. Try to login with authentication app.',
            ])->status(423);
        }
        if ($user->canSendSMSOtpCode()) {
            $user->sendAuthorizationCode(
                'is code to login to Landconnect. Never tell anyone this code.',
                $user->phone
            );
            $user->blockOTPviaSMS();

            return [
                'OTP_STEP'           => 2,
                'errors'             => null,
                'SMS_LOGIN_DISABLED' => true
            ];
        } else {
            throw ValidationException::withMessages([
                'smsOTP' => 'A SMS was recently sent to your number. Please try again later',
            ])->status(423);
        }
    }

    protected function _validateOTPLogin(Request $request, $tempUserId)
    {
        /** @var User $user */
        $user                    = User::findOrFail($tempUserId);
        $hasTooManyLoginAttempts = $this->hasTooManyLoginAttempts($request);
        if ($hasTooManyLoginAttempts) {
            $this->validate($request, ['g-recaptcha-response' => 'required|recaptcha']);
            $this->clearLoginAttempts($request);
        }

        $rules = ['fp' => 'nullable|string|max:32'];

        if ($request->get('otp') != '') {
            $rules = [
                'otp' => [
                    'required', function ($attribute, $value, $fail) use ($user, $request) {
                        $secret = $user->twofa_secret;
                        if ($secret && !$user->verifyOTPCode($secret, $value)) {
                            $this->incrementLoginAttempts($request);
                            $fail('Invalid code, please try again. Check that your device has correct time.');
                        }

                    }
                ]
            ];
        }

        if ($request->get('smsOTP') != '') {
            $rules = [
                'smsOTP' => [
                    'required', function ($attribute, $value, $fail) use ($user, $request) {
                        if (!$user->verifyAuthorizationCode($value, 600)) {
                            $this->incrementLoginAttempts($request);
                            $fail('You have entered an incorrect code');
                        }
                    }
                ]
            ];
        }
        if (!isset($rules['otp']) && !isset($rules['smsOTP'])) {
            throw ValidationException::withMessages([
                'otp'    => 'Code is required',
                'smsOTP' => 'Code from SMS is required',
            ]);
        }

        $this->validate($request, $rules);
    }

    protected function _attemptOnceLogin($request)
    {
        return $this->guard()->once(
            $this->credentials($request), $request->filled('remember')
        );
    }


}