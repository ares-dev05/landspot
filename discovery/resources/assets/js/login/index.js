import React, {Component} from 'react';
import {connect} from 'react-redux';
import {clickHandler, LoadingSpinner, validateEmail} from '~/helpers';
import Recaptcha from '../helpers/Recaptcha';
import store from './store';
import * as actions from './store/userLogin/actions';
import PropTypes from 'prop-types';
import Fingerprint2 from 'fingerprintjs2/fingerprint2';
import classnames from 'classnames';

const DEFAULT_FORM_VALUES = {
    email: '',
    password: '',
    otp: '',
    smsOTP: '',
    'g-recaptcha-response': ''
};

const LOGIN_STEP_AUTH = 0;
export const LOGIN_STEP_OTP_APP = 1;
const LOGIN_STEP_OTP_PHONE = 2;

class UserLoginForm extends Component {

    static propTypes = {
        getLoginConfig: PropTypes.func.isRequired,
        authorize: PropTypes.func.isRequired,
        sendSMSAuthorizationCode: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            form: {...DEFAULT_FORM_VALUES},
            loginStep: LOGIN_STEP_AUTH,
            errors: {},
            captcha: false,
            smsLoginDisabled: false
        };
    }

    componentDidMount() {
        const options = {
            excludes: {
                adBlock: true,
                fontsFlash: true,
                enumerateDevices: true
            }
        };
        const {requestIdleCallback} = window;

        const makeFingerPrint = () =>
            Fingerprint2.getPromise(options)
                        .then(components => {
                            const values = components.map(component => component.value);
                            const hash = Fingerprint2.x64hash128(values.join(''), 31);
                            const form = {...this.state.form};
                            form.fp = hash;
                            this.setState({form});
                        });

        if (requestIdleCallback) {
            requestIdleCallback(makeFingerPrint);
        } else {
            setTimeout(makeFingerPrint, 0);
        }
        this.props.getLoginConfig();
    }

    componentWillUnmount() {
        store.dispatch({type: 'CLEAN_LOGIN_STORE'});
    }

    static getDerivedStateFromProps(props, state) {
        const {errors, OTP_STEP, REDIRECT_URL, SMS_LOGIN_DISABLED} = props.userLogin;
        if (errors) {
            const newState = {
                isLoading: false,
                errors: {}
            };
            if (errors['g-recaptcha-response'] || errors['show_recaptcha']) {
                newState.captcha = true;
            }
            return newState;
        }

        if ((OTP_STEP === LOGIN_STEP_OTP_APP || OTP_STEP === LOGIN_STEP_OTP_PHONE) && OTP_STEP !== state.loginStep) {
            return {
                loginStep: OTP_STEP,
                isLoading: false,
                form: {...state.form, ...DEFAULT_FORM_VALUES}
            };
        } else if (OTP_STEP === false) {
            return {
                loginStep: LOGIN_STEP_AUTH,
                isLoading: false,
                form: {...state.form, ...DEFAULT_FORM_VALUES}
            };
        }

        if (REDIRECT_URL) {
            window.location = REDIRECT_URL;
        }

        if (SMS_LOGIN_DISABLED !== state.smsLoginDisabled) {
            if (SMS_LOGIN_DISABLED) {
                setTimeout(() => store.dispatch({type: 'ACTIVATE_SMS_LOGIN'}), 120000);
            }
            return {
                smsLoginDisabled: SMS_LOGIN_DISABLED,
                isLoading: false,
            };
        }

        return null;
    }

    onItemChange = (propertyName, value) => {
        const form = {...this.state.form};
        form[propertyName] = value;
        this.setState({form});
    };

    submitForm = () => {
        const stepValidator = {
            [LOGIN_STEP_AUTH]: {
                email: v => validateEmail(v) ? false : 'Invalid email',
                password: v => /^.+/.test(v) ? false : 'Password should not be empty'
            },
            [LOGIN_STEP_OTP_APP]: {
                otp: v => /^\d{6}$/.test(v) ? false : 'Please enter 6-digit code from app'
            },
            [LOGIN_STEP_OTP_PHONE]: {
                smsOTP: v => /^\d{6}$/.test(v) ? false : 'Please enter 6-digit code from SMS'
            }
        };
        const validator = stepValidator[this.state.loginStep];

        const errors = {};
        Object.keys(validator).map(key => errors[`${key}Error`] = validator[key](this.state.form[key]));
        this.setState({errors});

        if (!Object.keys(errors).some(v => errors[v])) {
            store.dispatch({type: 'RESET_LOGIN_ERRORS'});
            this.setState({
                isLoading: true,
                captcha: false
            });

            const form = document.getElementById('user-login-form');
            if (form) {
                this.props.authorize(form.action, this.state.form);
            } else {
                console.log('No login form!');
            }
        }
    };

    switchToLoginWithApp = () => {
        store.dispatch({type: 'ACTIVATE_APP_LOGIN'})
    };

    sendSMSCode = () => {
        if (!this.state.smsLoginDisabled) {
            this.props.sendSMSAuthorizationCode();
            store.dispatch({type: 'RESET_LOGIN_ERRORS'});
            this.setState({isLoading: true});
        }
    };

    render = () => {
        const {recaptchaKey, forgotPasswordUrl, errors} = this.props.userLogin;
        const {email, password, otp, smsOTP} = this.state.form;
        const {isLoading, loginStep, captcha, smsLoginDisabled} = this.state;
        const {emailError, passwordError, otpError, smsOTPError} = this.state.errors;
        const {submitForm, onItemChange, switchToLoginWithApp, sendSMSCode} = this;

        let errorMsgs = [];
        if (errors && Object.keys(errors).length) {
            const keys = Object.keys(errors).filter(key => key !== 'g-recaptcha-response' && key !== 'show_recaptcha');
            errorMsgs = keys.map(key => {
                return errors[key].toString();
            });
        }

        return <React.Fragment>
            {
                isLoading && <LoadingSpinner className='blocker'/>
            }

            {
                loginStep === LOGIN_STEP_AUTH &&
                <LoginStepAuth {...{email, password, emailError, passwordError, submitForm, onItemChange}}/>
            }

            {
                loginStep === LOGIN_STEP_OTP_APP &&
                <LoginStepOTPApp {...{otp, otpError, smsLoginDisabled, submitForm, onItemChange, sendSMSCode}}/>
            }

            {
                loginStep === LOGIN_STEP_OTP_PHONE &&
                <LoginStepOTPPhone {...{
                    smsOTP,
                    smsLoginDisabled,
                    smsOTPError,
                    submitForm,
                    onItemChange,
                    sendSMSCode,
                    switchToLoginWithApp
                }}/>
            }

            {
                captcha &&
                <React.Fragment>
                    <div className="form-group">
                        <span className="help-block">
                            <strong>Please pass the test</strong>
                        </span>
                        <Recaptcha siteKey={recaptchaKey}
                                   onVerify={response => this.onItemChange('g-recaptcha-response', response)}
                        />
                    </div>
                </React.Fragment>
            }

            {
                errorMsgs.map((msg, i) => <ErrorMessage message={msg} key={i}/>)
            }


            <div className="form-group">
                <a className="btn btn-link" rel="nofollow" href={forgotPasswordUrl}>
                    Forgot your Password?
                </a>
            </div>

            <div className="form-group">
                <button type="submit"
                        className="btn btn-primary"
                        onClick={e => clickHandler(e, submitForm)}
                >Log in
                </button>
            </div>
        </React.Fragment>;
    }
}

const LoginStepAuth = ({
                           email, password, emailError, passwordError,
                           submitForm, onItemChange
                       }) => (

    <React.Fragment>
        <div className={classnames('form-group', emailError && 'has-error')}>
            <input id="email"
                   type="email"
                   className="form-control"
                   placeholder="E-mail address"
                   name="email"
                   value={email}
                   autoFocus
                   onKeyPress={e => e.key === 'Enter' && clickHandler(e, submitForm)}
                   onChange={e => onItemChange('email', e.target.value)}
            />
            {
                emailError && <ErrorMessage message={emailError}/>
            }
        </div>
        <div className={classnames('form-group', passwordError && 'has-error')}>
            <input id="password"
                   type="password"
                   className="form-control"
                   placeholder="Password"
                   name="password"
                   value={password}
                   onKeyPress={e => e.key === 'Enter' && clickHandler(e, submitForm)}
                   onChange={e => onItemChange('password', e.target.value)}
            />
            {
                passwordError && <ErrorMessage message={passwordError}/>
            }
        </div>
    </React.Fragment>
);

const LoginStepOTPApp = ({
                             otp, otpError, smsLoginDisabled,
                             submitForm, onItemChange, sendSMSCode
                         }) => (
    <React.Fragment>
        <div className={classnames('form-group', otpError && 'has-error')}>
            <label className='otp-text'
                   htmlFor='otp'>Two factor authorization is enabled. Please enter a code from authenticaion
                app.</label>
            <input id="otp"
                   type="text"
                   className="form-control"
                   placeholder="6-digit code"
                   maxLength="6"
                   value={otp}
                   onKeyPress={e => e.key === 'Enter' && clickHandler(e, submitForm)}
                   onChange={e => onItemChange('otp', e.target.value)}
                   autoComplete="off"
                   ref={node => node && node.focus()}
            />
            {
                otpError && <ErrorMessage message={otpError}/>
            }
        </div>

        {
            !smsLoginDisabled &&
            <div className="form-group">
                {
                    <a className="btn btn-link"
                       href='#'
                       onClick={e => clickHandler(e, sendSMSCode)}
                    >Unable to login? Send me a SMS</a>
                }

            </div>
        }
    </React.Fragment>
);

const LoginStepOTPPhone = ({
                               smsOTP, smsOTPError, smsLoginDisabled,
                               submitForm, onItemChange, switchToLoginWithApp, sendSMSCode
                           }) => (
    <React.Fragment>
        <div className={classnames('form-group', smsOTPError && 'has-error')}>
            <label className='otp-text'
                   htmlFor='otp'>Two factor authorization is enabled.</label>
            <input id="otp"
                   type="text"
                   className="form-control"
                   placeholder="6-digit code from SMS"
                   maxLength="6"
                   value={smsOTP}
                   onKeyPress={e => e.key === 'Enter' && clickHandler(e, submitForm)}
                   onChange={e => onItemChange('smsOTP', e.target.value)}
                   autoComplete="off"
                   ref={node => node && node.focus()}
            />
            {
                smsOTPError && <ErrorMessage message={smsOTPError}/>
            }
        </div>
        {
            <div className='form-group'>A SMS with authorization code was sent to your phone number.
                <br/>
                Have not received the SMS?
                &nbsp;
                <a href='#'
                   style={smsLoginDisabled ? {opacity: 0.5} : null}
                   onClick={e => clickHandler(e, sendSMSCode)}
                >Send me a new one {smsLoginDisabled && '(will be available later)'}</a>
            </div>
        }

        <div className="form-group">
            <a className='btn-link'
               href='#'
               onClick={e => clickHandler(e, switchToLoginWithApp)}
            >Login with authentication app</a>
        </div>
    </React.Fragment>
);

const ErrorMessage = ({message}) => <span className="help-block"><strong>{message}</strong></span>;

export default connect((state => ({userLogin: state.userLogin})), actions)(UserLoginForm);