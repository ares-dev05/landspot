import React, {useState, useEffect} from 'react';
import PhoneInput, {isValidPhoneNumber} from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import ReactCodeInput from 'react-verification-code-input';
import 'react-phone-number-input/style.css';
import {useTimer} from '~/helpers/hooks/useTimer';
import {LoadingSpinner} from '~/helpers';

const RESEND_CODE_TIMER_SECONDS = 10;
const VERIFY_ATTEMPTS_TIMER_SECONDS = 20;
const VERIFY_CODE_ATTEMPTS = 5;
const CODE_FIELDS = 6;
const PHONE_FIELDS = 9;
const COUNTRY_CODE_AU = '+61';

const ThirdEnquireStep = ({
                              setFormState,
                              sendCode,
                              verifyCode,
                              enquireState: {codeSent, formData},
                              loading,
                          }) => {
    const [sendAgain, setSendAgain] = useState(false);
    const [canVerify, setCanVerify] = useState(false);
    const [timerSendAgain, setTimerSendAgain] = useState(false);
    const [verifyCodeAttempts, setVerifyCodeAttempts] = useState(VERIFY_CODE_ATTEMPTS);
    let timerBetweenAttempts = useTimer(timerSendAgain && !loading, RESEND_CODE_TIMER_SECONDS, !timerSendAgain);
    let timerTooMuchAttempts = useTimer(verifyCodeAttempts <= 0 && !loading, VERIFY_ATTEMPTS_TIMER_SECONDS, verifyCodeAttempts > 0);

    useEffect(() => {
        if (timerBetweenAttempts === 0) {
            setTimerSendAgain(false);
        }
    }, [timerBetweenAttempts === 0]);

    useEffect(() => {
        if (timerTooMuchAttempts === 0) {
            setVerifyCodeAttempts(VERIFY_CODE_ATTEMPTS);
        }
    }, [timerTooMuchAttempts === 0]);

    const handleSendCode = () => {
        setSendAgain(true);
        setTimerSendAgain(true);
        sendCode();
    };

    const handleVerifyCode = () => {
        setVerifyCodeAttempts(t => t - 1);
        verifyCode();
    };

    const handleCodeInputs = (data) => {
        setFormState({code: data});
        setCanVerify(parseInt(data.length) === CODE_FIELDS);
    };

    const handlePhoneInputs = (data) => {
        if (parseInt(data.length) === PHONE_FIELDS && isValidPhoneNumber(COUNTRY_CODE_AU + data)) {
            setFormState({phoneShort: data, phone: COUNTRY_CODE_AU + data});
        }
    };

    return (
        <div className="enquire-form sms-form">
            <div className='form-body'>
                <h4 className='sms-title'>SMS Verification</h4>
                <div className='sms-description'>
                    Enter your phone number and we will send you a code to finish the enquiry process.
                </div>

                <div className="phone-input">
                    <PhoneInput
                        defaultCountry="AU"
                        international
                        withCountryCallingCode
                        addInternationalOption={false}
                        countryCallingCodeEditable={false}
                        countries={['AU']}
                        displayInitialValueAsLocalNumber
                        flags={flags}
                        placeholder="Enter phone number"
                        onChange={f => f}
                        disabled
                    />
                    <div className="form-verification">
                        <ReactCodeInput
                            className='form-verification-inputs'
                            autoFocus
                            fields={PHONE_FIELDS}
                            type='number'
                            values={Array.from(formData.phoneShort.toString())}
                            onChange={value => handlePhoneInputs(value)}
                        />
                    </div>
                </div>
                {loading
                    ? <LoadingSpinner isStatic={true}/>
                    : <React.Fragment>
                        <div className='phone-send'>
                            {!sendAgain && !timerSendAgain && (
                                <button
                                    disabled={!isValidPhoneNumber(formData.phone)}
                                    className={`enquire-button sms-send ${isValidPhoneNumber(formData.phone) ? 'active' : ''}`}
                                    onClick={handleSendCode}
                                >
                                    Send code
                                </button>
                            )}
                            {sendAgain && (
                                <div className="send-again-wrapper">
                                    <span>Didn’t get code?</span>
                                    <div
                                        className={`send-again ${(timerSendAgain || verifyCodeAttempts === 0) && 'disabled'}`}
                                        onClick={() => (!timerSendAgain && verifyCodeAttempts !== 0) && handleSendCode()}
                                    >
                                        {`Send again ${(timerSendAgain && verifyCodeAttempts !== 0) ? '(' + timerBetweenAttempts + ')' : ''}`}
                                    </div>
                                </div>
                            )}
                        </div>
                        {codeSent && (
                            <div className="wrapper-code">
                                <div className="sms-info">Enter 6-digit code from SMS</div>
                                <div className="form-verification">
                                    {verifyCodeAttempts !== 0
                                        ? <ReactCodeInput
                                            autoFocus
                                            className='form-verification-inputs'
                                            fields={CODE_FIELDS}
                                            values={Array.from(formData.code.toString())}
                                            type='number'
                                            onChange={value => handleCodeInputs(value)}
                                        />
                                        : <div className='form-verification-wait'>
                                            {`Wait ${timerTooMuchAttempts}`}
                                        </div>
                                    }
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                }
            </div>
            <button
                disabled={!canVerify || verifyCodeAttempts === 0}
                className="enquire-button"
                onClick={handleVerifyCode}
            >
                Submit
            </button>
        </div>
    );
};

export default ThirdEnquireStep;