import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import DataSection from '~/helpers/DataSection';
import store from '../store';
import Recaptcha from '~/helpers/Recaptcha';
import Configure2FA from './Configure2FA';

const PropsContext = React.createContext();

class TwoFactorAuthentication extends Component {

    static propTypes = {
        authorizeFor2FAConfiguration: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            isSaving: false,
            form: {
                password: '',
                code: '',
            },
        };
    }

    componentWillUnmount() {
        store.dispatch({type: 'RESET_AUTHORIZATION'});
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState) {
        const {isSaving} = this.state;
        if (isSaving && isSaving === prevState.isSaving) {
            this.setState({isSaving: false});
        }
    }

    onItemChange = (propertyName, value) => {
        const form = {...this.state.form};
        form[propertyName] = value;
        this.setState({form});
    };

    submitUserPassword = () => {
        this.props.authorizeFor2FAConfiguration(this.state.form);
        this.setState({
            isSaving: true,
            form: {password: ''}
        });
    };

    verifyCaptcha = (recaptchaAnswer) => {
        this.props.authorizeFor2FAConfiguration({recaptchaAnswer});
    };

    render() {
        const {onItemChange, submitUserPassword, verifyCaptcha} = this;
        const handlers = {onItemChange, submitUserPassword, verifyCaptcha};
        const {user: {phone}} = this.props.userProfile;

        return (
            <PropsContext.Provider value={{state: this.state, props: this.props, handlers}}>
                <DataSection
                    title='Two Factor Authentication'
                    isSaving={this.state.isSaving}
                    component={<TwoFactorAppSection phone={phone}/>}
                />
            </PropsContext.Provider>
        );
    }
}

const TwoFactorAppSection = ({phone}) => (
    <React.Fragment>
        {phone
            ? <TwoFactorAuthorization/>
            : <div className="form-rows">
                <div className='form-row column'>
                    In order to enable Two Factor Authentication on your account please add your phone number
                </div>
            </div>
        }

    </React.Fragment>
);

const TwoFactorAuthorization = () => (
    <PropsContext.Consumer>
        {
            ({props}) => props.userProfile['PASSWORD_AUTHORIZED']
                ? <Configure2FA {...props}/>
                : <EnterUserPasswordField/>
        }
    </PropsContext.Consumer>
);

const EnterUserPasswordField = () => (
    <PropsContext.Consumer>
        {
            ({props: {userProfile}, handlers}) => userProfile['CAPTCHA_REQUIRED']
                ? <Recaptcha siteKey={userProfile['RECAPTCHA_SITEKEY']}
                             onVerify={handlers.verifyCaptcha}
                />
                : <PasswordField/>
        }
    </PropsContext.Consumer>
);

const PasswordField = () => (
    <PropsContext.Consumer>
        {
            ({state: {form: {password}}, handlers}) =>
                <div className="form-rows">
                    <div className='form-row column'>
                        <label htmlFor='code'>For security reasons please enter you current password</label>

                        <div className='landspot-input'>
                            <input type='password'
                                   value={password}
                                   maxLength={100}
                                   ref={node => node && node.focus()}
                                   placeholder='Password'
                                   onKeyPress={e => e.key === 'Enter' && handlers.submitUserPassword()}
                                   onChange={e => handlers.onItemChange('password', e.target.value)}
                            />
                        </div>
                    </div>
                    <button type='button'
                            className={classnames('button', password !== '' ? 'default' : '')}
                            disabled={password === ''}
                            onClick={handlers.submitUserPassword}
                    >SUBMIT
                    </button>
                </div>
        }
    </PropsContext.Consumer>
);

export {TwoFactorAuthentication};