import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {LoadingSpinner} from '~/helpers';

const STEP_0_2FA_INFO = 0;
const STEP_1_QR_CODE = 1;
const STEP_2_ENTER_OTP = 2;
const STEP_3_VALIDATE_OTP = 3;

class Configure2FA extends Component {
    static propTypes = {
        get2FAConfig: PropTypes.func.isRequired,
        verifyOTPcode: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            preloader: false,
            step: STEP_0_2FA_INFO,
            code: '',
        };
    }

    componentWillUnmount() {

    }

    componentDidMount() {
        this.props.get2FAConfig();
    }

    onItemChange = (propertyName, value) => {
        value = value.replace(/\D/, '');
        this.setState({[propertyName]: value});
    };

    componentDidUpdate(prevProps, prevState) {
        const {TWOFA_ACTIVE, TEMP_SECRET_KEY}    = this.props.userProfile;
        const {preloader, step} = this.state;

        if (TWOFA_ACTIVE && step > STEP_1_QR_CODE && !TEMP_SECRET_KEY) {
            console.log(this.state);
            this.setState({
                step: STEP_0_2FA_INFO,
            });
        }
        if (preloader && preloader === prevState.preloader) {
            this.setState({preloader: false});
        }
    }

    setStep = (step) => {
        if (step === STEP_3_VALIDATE_OTP) {
            this.submitOTPCode();
        } else {
            this.setState({step});
            if (step === STEP_0_2FA_INFO && this.props.userProfile.TEMP_SECRET_KEY) {
                this.props.get2FAConfig();
            }
        }
    };

    submitOTPCode = () => {
        this.props.verifyOTPcode({code: this.state.code});
        this.setState({preloader: true, code: ''});
    };

    requestNewSecretKey = () => {
        this.props.get2FAConfig({renew_key: 1});
    };

    render() {
        const {
            QRCODE, SECRET_KEY, OTP_CODE_INVALID, TWOFA_ACTIVE, TEMP_SECRET_KEY, TEMP_QRCODE
        } = this.props.userProfile;
        const {step, code, preloader} = this.state;
        const disabledNextButton = step === 2 && !/^\d{6}$/.test(code);

        return (
            <React.Fragment>
                {
                    preloader && <LoadingSpinner/>
                }

                {
                    (step => {
                        switch (step) {
                            case STEP_0_2FA_INFO:
                                return <STEP_2FA_INFO
                                    {...{TWOFA_ACTIVE}}/>;

                            case STEP_1_QR_CODE:
                                return <STEP_QR_CODE
                                    {...{QRCODE, SECRET_KEY, TWOFA_ACTIVE, TEMP_SECRET_KEY, TEMP_QRCODE}}/>;

                            case STEP_2_ENTER_OTP:
                                return <STEP_ENTER_OTP {...{code, OTP_CODE_INVALID}}
                                                       submitOTPCode={this.submitOTPCode}
                                                       onItemChange={this.onItemChange}/>;
                        }
                    })(step)
                }

                <div className='btn-group'>
                    {
                        step > STEP_0_2FA_INFO &&
                        <button type='button'
                                className='button default'
                                onClick={() => this.setStep(step - 1)}
                        >BACK</button>
                    }

                    {
                        (!TWOFA_ACTIVE || TWOFA_ACTIVE && (TEMP_SECRET_KEY || step === STEP_0_2FA_INFO)) &&
                        <button type='button'
                                className={classnames('button', !disabledNextButton ? 'primary' : '')}
                                disabled={disabledNextButton}
                                onClick={() => this.setStep(step + 1)}
                        >NEXT
                        </button>
                    }

                    {
                        TWOFA_ACTIVE && step === STEP_1_QR_CODE &&
                        <button type='button'
                                className='button default'
                                onClick={this.requestNewSecretKey}
                        >GENERATE A NEW KEY
                        </button>
                    }
                </div>
            </React.Fragment>
        );
    }
}

const STEP_2FA_INFO = ({TWOFA_ACTIVE}) => (
    <React.Fragment>
        {
            TWOFA_ACTIVE &&
            <p className='notice'>Two Factor Authentication is enabled on your account.</p>
        }

        <p>Please install one of listed below authentication apps to generate login codes</p>
        <p><b>Android based devices: </b><a
            className='link'
            rel="noopener noreferrer"
            href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
            target='_blank'>Google Authenticator</a> | <a className='link'
            rel="noopener noreferrer"
            href="https://play.google.com/store/apps/details?id=org.fedorahosted.freeotp" target='_blank'>FreeOTP
            Authenticator</a></p>


        <p><b>Apple iOS based devices: </b><a
            className='link'
            rel="noopener noreferrer"
            href='https://itunes.apple.com/ua/app/google-authenticator/id388497605'>Google
            Authenticator</a> | <a href="https://itunes.apple.com/us/app/freeotp-authenticator/id872559395"
                                   className='link'
                                   rel="noopener noreferrer"
                                   target='_blank'>FreeOTP Authenticator</a></p>
    </React.Fragment>
);

const STEP_QR_CODE = ({QRCODE, SECRET_KEY, TEMP_SECRET_KEY, TEMP_QRCODE}) => {
    const [qrCode, secretKey] = TEMP_SECRET_KEY ? [TEMP_QRCODE, TEMP_SECRET_KEY] : [QRCODE, SECRET_KEY];

    return <React.Fragment>
        <p>Use your authentication app to scan this QR code. Backup this secret key and store it in secure place.</p>
        {
            qrCode
                ?
                <div>
                    <div className='otp-secret'>
                        <div className='qr'>
                            <img src={qrCode}/>
                        </div>
                        <div className='secret'>
                            <div className='note'>Or enter this code into your authentication app</div>
                            <div className='key'>{secretKey.split(/(\w{4})/).filter(w => w).join(' ')}</div>
                        </div>
                    </div>
                    {
                        <p>
                            {
                                !TEMP_SECRET_KEY
                                    ? 'You can change current secret key. The old key will be deactivated.'
                                    : <span className='notice'>This is your new secret key. Click &#34;NEXT&#34; to
                                        validate and acticate it.</span>
                            }
                        </p>
                    }
                </div>
                : <p>An error was occurred, please refresh the page</p>
        }
    </React.Fragment>;
};


const STEP_ENTER_OTP = ({onItemChange, submitOTPCode, code, OTP_CODE_INVALID}) => (
    <div className='form-rows'>
        <p>Please select your account and enter the confirmation code you see on your authentication app.</p>
        <div className="form-row column">
            <div className='landspot-input'>
                <input type='text'
                       className='otp-input'
                       maxLength={6}
                       value={code}
                       size={4}
                       placeholder={'XXXXXX'}
                       ref={node => node && node.focus()}
                       onKeyPress={e => e.key === 'Enter' && submitOTPCode()}
                       onChange={e => onItemChange('code', e.target.value)}
                />
            </div>
        </div>
        {
            OTP_CODE_INVALID &&
            <div className='notice'>
                This code isn&apos;t correct. Please try again.
                The date and time on your device must be correct and synced with a global time.
            </div>
        }
    </div>
);
export default Configure2FA;