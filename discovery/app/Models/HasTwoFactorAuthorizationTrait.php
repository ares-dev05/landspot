<?php

namespace App\Models;

use ClickSendLib\Models\SmsMessageCollection;
use OTPHP\TOTP;
use \Illuminate\Mail\Message;
use chillerlan\QRCode\{
    QRCode, QROptions
};
use Illuminate\Support\Facades\{
    Crypt, Mail
};
use \ClickSendLib\Configuration;
use ParagonIE\ConstantTime\Base32;
use \ClickSendLib\Controllers\SMSController;
use Illuminate\Contracts\Encryption\DecryptException;

/**
 * Trait ResizeImageTrait
 * @property string $path
 */
trait HasTwoFactorAuthorizationTrait
{
    /**
     * @throws \Exception
     */
    function blockNextPhoneChange()
    {
        $id = $this->id;
        $time = time();
        cache(['user:' . $id . ':last_phone_reset_ts' => $time], 86400);
        cache()->forget('user:' . $id . ':new_phone');
        cache()->forget('user:' . $id . ':new_phone_request_ts');
    }

    /**
     * @throws \Exception
     */
    function blockPhoneRequestChange()
    {
        $id = $this->id;
        $time = time();
        cache(['user:' . $id . ':new_phone_request_ts' => $time + 120], 120);
    }

    /**
     * @param $phone
     * @throws \Exception
     */
    function storeNewPhoneNumber($phone)
    {
        $id = $this->id;
        cache(['user:' . $id . ':new_phone' => $phone], 150);
    }

    /**
     * @return string
     * @throws \Exception
     */
    function getNewPhoneNumber()
    {
        $id = $this->id;

        return cache('user:' . $id . ':new_phone');
    }

    /**
     * @return int
     * @throws \Exception
     */
    function failedAuthorizationAttempts()
    {
        $id = $this->id;

        return cache('user:' . $id . ':auth_password_attempt');
    }

    /**
     * @return \Illuminate\Cache\CacheManager|mixed
     * @throws \Exception
     */
    function canSendSMSOtpCode()
    {
        $id = $this->id;

        return !cache('user:' . $id . ':auth_sms_otp');
    }

    /**
     * @return \Illuminate\Cache\CacheManager|mixed
     * @throws \Exception
     */
    function blockOTPviaSMS()
    {
        $id = $this->id;

        cache(['user:' . $id . ':auth_sms_otp' => 1], 120);
    }

    /**
     * @return int
     * @throws \Exception
     */
    function resetFailedAuthorizationAttempts()
    {
        $id = $this->id;

        return cache()->forget('user:' . $id . ':auth_password_attempt');
    }

    /**
     * @return int
     * @throws \Exception
     */
    function incFailedAuthorizationAttempts()
    {
        $id = $this->id;
        $key = 'user:' . $id . ':auth_password_attempt';
        $attempts = $this->failedAuthorizationAttempts();
        if ($attempts === null) {
            cache([$key => 0], 600);
        }

        return cache()->increment($key);
    }

    /**
     * @return int
     * @throws \Exception
     */
    function authorizeAccessToSecureSection()
    {
        $id = $this->id;
        $key = 'user:' . $id . ':security_access_granted';

        return cache([$key => 1], 300);
    }

    /**
     * @return \Illuminate\Cache\CacheManager|mixed
     * @throws \Exception
     */
    function hasAccessToSecureSection()
    {
        $id = $this->id;
        $key = 'user:' . $id . ':security_access_granted';

        return cache($key);
    }

    /**
     * @throws \Exception
     */
    function cleanCacheVariables()
    {
        $id = $this->id;
        $this->resetFailedAuthorizationAttempts();
        cache()->forget('user:' . $id . ':new_phone');
        cache()->forget('user:' . $id . ':new_phone_request_ts');
        $this->deleteOTPTempSecret();
    }

    /**
     * @param $v
     * @throws \Exception
     */
    function storeOTPTempSecret($v)
    {
        $secret = Crypt::encryptString($v);
        $id = $this->id;
        $key = 'user:' . $id . ':temp_otp_secret_value';
        cache([$key => $secret], 86400);
    }

    /**
     * @return \Illuminate\Cache\CacheManager|mixed
     * @throws \Exception
     */
    function getOTPTempSecret()
    {
        $id = $this->id;
        $key = 'user:' . $id . ':temp_otp_secret_value';
        $secret = cache($key);
        if ($secret) {
            try {
                $secret = Crypt::decryptString($secret);
            } catch (DecryptException $e) {

            }
        }

        return $secret;
    }

    /**
     * @throws \Exception
     */
    function deleteOTPTempSecret()
    {
        $id = $this->id;
        cache()->forget('user:' . $id . ':temp_otp_secret_value');
    }

    function setUserSecret($v)
    {
        $user = $this;

        return \DB::transaction(function () use ($user, $v) {
            User::where($user->getKeyName(), $user->getKey())
                ->lockForUpdate()
                ->get();

            return $user->update(['twofa_secret' => $v]);
        });
    }

    /**
     * @param string $secret
     * @param int $period
     * @return TOTP
     */
    function getOTPLib($secret, $period = 30)
    {
        if (!$this->_otpLib) {
            $this->_otpLib = TOTP::create($secret, $period);
        }

        return $this->_otpLib;
    }

    /**
     * @param bool $generateTemporary
     * @return array
     * @throws \Exception
     */
    function generateQRCodeFromSecret($generateTemporary = false)
    {
        $email = $this->email;
        $SECRET_KEY = $this->twofa_secret;
        $TEMP_SECRET_KEY = '';
        $QRCODE = '';
        $TEMP_QRCODE = '';

        $secretFormat = 'otpauth://totp/%s?secret=%s&algorithm=SHA1&digits=6&period=30&issuer=Landconnect';

        $email = mb_convert_encoding($email, 'ISO-8859-1');
        $email = mb_substr($email, 0, 40);
        $profile = urlencode('Landconnect:' . $email);

        $TEMP_SECRET_KEY = $this->getOTPTempSecret();

        if ($generateTemporary) {
            $TEMP_SECRET_KEY = substr(Base32::encodeUpper(random_bytes(16)), 0, 16);
            $this->storeOTPTempSecret($TEMP_SECRET_KEY);
        }

        $qrLib = new QRCode(new QROptions([
            'version' => 7,
            'outputType' => QRCode::OUTPUT_IMAGE_PNG,
            'eccLevel' => QRCode::ECC_L,
        ]));

        if ($SECRET_KEY) {
            $QRCODE = $qrLib->render(sprintf($secretFormat, $profile, $SECRET_KEY));
        }

        if ($TEMP_SECRET_KEY) {
            $TEMP_QRCODE = $qrLib->render(sprintf($secretFormat, $profile, $TEMP_SECRET_KEY));
        }

        return compact('QRCODE', 'TEMP_QRCODE', 'SECRET_KEY', 'TEMP_SECRET_KEY');
    }

    /**
     * @param $secret
     * @param $code
     * @return bool
     * @throws \Exception
     */
    function verifyOTPCode($secret, $code)
    {
        if (!$secret) {
            throw new \Exception('Secret key required');
        }

        return $this->getOTPLib($secret)->verify($code);
    }

    function getTwoFASecretAttribute($secret)
    {
        if ($secret) {
            try {
                $secret = Crypt::decryptString($secret);
            } catch (DecryptException $e) {

            }
        }

        return $secret;
    }

    function setTwoFASecretAttribute($secret)
    {
        try {
            $secret = Crypt::encryptString($secret);
        } catch (DecryptException $e) {

        }
        $this->attributes['twofa_secret'] = $secret;

        return $secret;
    }

    protected function _generateSecretFromUserData()
    {
        $secret = hash_hkdf('sha512', $this->password . $this->phone . config('app.key'), 0, '', $this->id);

        return Base32::encode($secret);
    }

    public function generateCode(): string
    {
        $secret = $this->_generateSecretFromUserData();
        $otp = $this->getOTPLib($secret, 30);
        return $otp->now();
    }

    public function sendEmail(string $text, string $email): void
    {
        Mail::raw(
            $text,
            function (Message $msg) use ($email) {
                $msg->from(config('mail.from.address'), config('mail.from.name'))->subject('Authorization code');
                $msg->to($email);
            });
    }

    public function sendSMS(string $text, string $phone): void
    {
        Configuration::$username = config('twofa.CLICKSEND_USERNAME');
        Configuration::$key = config('twofa.CLICKSEND_KEY');

        $messages = new SmsMessageCollection([
            [
                'source' => 'php',
                'from' => 'Lotmix',
                'body' => $text,
                'to' => $phone
            ]
        ]);

        try {
            $controller = new SMSController();
            $response = $controller->sendSms($messages);
            logger()->info(
                json_encode($response)
            );
        } catch (\Exception $e) {
            logger()->error($e->getMessage());
            throw $e;
        }
    }

    /**
     * @param $message
     * @param $phone
     * @throws \Exception
     */
    function sendAuthorizationCode(string $message, string $phone): void
    {
        $code = $this->generateCode();
        $gateway = config('twofa.OTP_CODE_GATEWAY');
        $email = $this->email;
        $text = $code . ' ' . $message;

        switch ($gateway) {
            case 'mail':
                $this->sendEmail($text, $email);
                break;
            case 'phone':
                if (!$phone) {
                    throw new \Exception('Phone is empty');
                }

                $this->sendSMS($text, $phone);
                break;

            default:
                throw new \Exception('Please define one of OTP code gateways');
        }
    }

    function verifyAuthorizationCode($code, $window)
    {
        $secret = $this->_generateSecretFromUserData();
        $otp = $this->getOTPLib($secret, 30);

        return $otp->verify($code, null, $window);
    }
}