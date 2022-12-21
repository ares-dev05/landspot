import React, {useEffect, useState} from 'react';

import {get} from 'lodash';
import {withAlert} from 'react-alert';
import PhoneInput, {isValidPhoneNumber} from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import ReactCodeInput from 'react-verification-code-input';

import 'react-phone-number-input/style.css';
import StepLeftSection from '../StepLeftSection';
import {sendCompaniesEnquireForm, sendSMSVerification, verifySMSCode} from '../../store/actions';

import {useTimer} from '~/helpers/hooks/useTimer';

const CODE_FIELDS = 6;
const PHONE_FIELDS = 9;
const COUNTRY_CODE_AU = '+61';
const VERIFY_ATTEMPTS_TIMER_SECONDS = 20;
const VERIFY_CODE_ATTEMPTS = 5;
const RESEND_CODE_TIMER_SECONDS = 10;

const SMSVerification = ({formData: prevFormData, alert, handlePrevStep}) => {
    const [formData, setFormData] = useState(prevFormData);
    const [showCode, setShowCode] = useState(false);
    const [loading, setLoading] = useState(false);


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

    function showError(e) {
        const {data} = e.response;
        let errors = data.errors || [data.message];

        errors = Array.isArray(errors) ? errors : Object.values(errors).flat();
        alert.error(
            errors.map(
                (msg, errorIndex) => (<div key={errorIndex}><p>{msg}</p></div>)
            ));
    }

    const sendCode = async () => {
        if (timerSendAgain || verifyCodeAttempts === 0) {
            return;
        }
        setSendAgain(true);
        setTimerSendAgain(true);
        const {firstName, lastName, email, phone} = formData;
        try {
            setLoading(true);
            const response = await sendSMSVerification({firstName, lastName, email, phone});
            if (get(response, 'data.codeSent')) {
                setLoading(false);
                if (!showCode) {
                    setShowCode(!showCode);
                }

                if (!sendAgain) {
                    setSendAgain(!sendAgain);
                }
            }
        } catch (e) {
            setLoading(false);
            showError(e);
        }
    };

    const verifyCode = async () => {
        setVerifyCodeAttempts(t => t - 1);
        const {phone, code} = formData;
        try {
            setLoading(true);
            const responseSMS = await verifySMSCode({phone, code});
            if (get(responseSMS, 'data.verified')) {

                const responseSend = await sendCompaniesEnquireForm(formData);
                const success = get(responseSend, 'data.success');
                if (success) {
                    window.location.replace('/enquire/submission');
                }
            }
        } catch (e) {
            setLoading(false);
            showError(e);
        }
    };

    const handleCodeInputs = (data) => {
        updateFormData({code: data});
        setCanVerify(parseInt(data.length) === CODE_FIELDS);
    };

    const handlePhoneInputs = (data) => {
        if (parseInt(data.length) === PHONE_FIELDS && isValidPhoneNumber(COUNTRY_CODE_AU + data)) {
            updateFormData({phoneShort: data, phone: COUNTRY_CODE_AU + data});
        }
        if (formData.phoneShort && parseInt(data.length) !== PHONE_FIELDS) {
            updateFormData({phoneShort: '', phone: ''});
        }
    };

    const updateFormData = (data) => {
        setFormData({...formData, ...data});
    };

    const VerifyCode = () => (
        <div className="wrapper-code">
            <div className="sms-info">Enter 6-digit code from SMS</div>
            <div className="form-verification">
                {verifyCodeAttempts !== 0
                    ? <ReactCodeInput
                        autoFocus
                        className='form-verification-inputs'
                        fields={CODE_FIELDS}
                        values={Array.from(get(formData, 'code', '').toString())}
                        type='number'
                        onChange={handleCodeInputs}
                    />
                    : <div className='form-verification-wait'>
                        {`Wait ${timerTooMuchAttempts}`}
                    </div>
                }
            </div>

            <div className="gdpr">
                <input
                    type="checkbox"
                    name="processOfPersonalData"
                    checked={get(formData, 'isProvidedData', false)}
                    onChange={() => updateFormData({isProvidedData: !get(formData, 'isProvidedData', false)})}
                />
                <span> I understand the builders I've selected on this form, will be provided my responses and contact details to assist me. </span>
            </div>
            <button
                disabled={!canVerify || !get(formData, 'isProvidedData') || verifyCodeAttempts === 0 || loading}
                className={`btn-step ${canVerify && get(formData, 'isProvidedData') && verifyCodeAttempts > 0 && !loading ? 'next-step' : ''}`}
                onClick={verifyCode}
            >
                Submit enquiry
            </button>
        </div>
    );

    return (
        <div className="multi-step-layout">
            <StepLeftSection
                formData={formData}
                header={
                    <React.Fragment>
                        You made it, <span>{get(formData, 'firstName', '')}!</span>
                    </React.Fragment>
                }
                text="It's important builders know you are a real, contactable person! Please confirm your mobile number."
            />
            <div className="right-section">
                <div className="section-row with-line active desktop">
                    <button className="btn-step" onClick={() => handlePrevStep()}>Back to previous section</button>
                </div>

                <div className="section-row navigation responsive">
                    <div className="step-number complete" onClick={() => handlePrevStep(5)}>&#10003;</div>
                    <div className="step-number complete" onClick={() => handlePrevStep(4)}>&#10003;</div>
                    <div className="step-number complete" onClick={() => handlePrevStep(3)}>&#10003;</div>
                    <div className="step-number complete" onClick={() => handlePrevStep(2)}>&#10003;</div>
                    <div className="step-number complete" onClick={() => handlePrevStep()}>&#10003;</div>
                    <div className="step-number active">6</div>
                </div>

                <div className="section-row">
                    <div className="step-number active desktop">6</div>
                    <p className="step-title active">SMS Verification</p>
                </div>
                <div className='sms-verification-container'>
                    <div className='description'>
                        Enter your phone number and we will send you a code to finish the enquiry process.
                    </div>

                    <div className='row'>
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
                                    values={Array.from(get(formData, 'phoneShort', '').toString())}
                                    onChange={handlePhoneInputs}
                                />
                            </div>

                        </div>
                        {!sendAgain && !timerSendAgain && (
                            <button
                                disabled={!isValidPhoneNumber(get(formData, 'phone', ''))}
                                className={`btn-step send-code ${isValidPhoneNumber(get(formData, 'phone', '')) ? 'next-step' : ''}`}
                                onClick={sendCode}
                            >
                                Send code
                            </button>
                        )}
                        {sendAgain && (
                            <div className="send-again-wrapper">
                                <span>Didn’t get code?</span>
                                <div
                                    className={`send-again ${(timerSendAgain || verifyCodeAttempts === 0) && 'disabled'}`}
                                    onClick={sendCode}
                                >
                                    {`Send again ${(timerSendAgain && verifyCodeAttempts !== 0) ? '(' + timerBetweenAttempts + ')' : ''}`}
                                </div>
                            </div>
                        )}
                    </div>
                    {showCode && (
                        <VerifyCode/>
                    )}
                </div>
            </div>
        </div>
    );
};

export default withAlert(SMSVerification);