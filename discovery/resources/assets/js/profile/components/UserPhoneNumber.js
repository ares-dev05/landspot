import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classnames from 'classnames';
import DataSection from '~/helpers/DataSection';

class UserPhoneNumber extends Component {

    static propTypes = {
        changeUserPhone: PropTypes.func.isRequired,
        updateUserProfile: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            isSaving: false,
            form: {
                code: '',
                phone: ''
            },
            timeoutStr: ''
        };
        this.timer = null;
    }

    componentWillUnmount() {
        this.stopPhoneTimer();
    }

    componentDidMount() {
        const {user} = this.props.userProfile;
        const {PHONE_AUTHORIZATION_STEP} = user;

        if (PHONE_AUTHORIZATION_STEP > new Date().getTime() / 1000) {
            this.startPhoneTimer();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const {errors, ajaxSuccess, ajaxError, user} = this.props.userProfile;
        const {isSaving} = this.state;

        if (errors || ajaxSuccess || ajaxError) {
            if (ajaxSuccess) {
                this.setState({phone: '', code: ''});
            }
        }

        if (isSaving && isSaving === prevState.isSaving) {
            this.setState({isSaving: false});
        }

        const {PHONE_AUTHORIZATION_STEP} = user;
        if (PHONE_AUTHORIZATION_STEP > new Date().getTime() / 1000) {
            this.startPhoneTimer();
        }
    }

    startPhoneTimer = () => {
        if (this.timer) {
            window.clearInterval(this.timer);
        }
        this.timer = window.setInterval(this.decrementPhoneAuthorizationTimer, 1000);
    };

    stopPhoneTimer = () => {
        if (this.timer) {
            window.clearInterval(this.timer);
            this.timer = null;
        }
    };

    decrementPhoneAuthorizationTimer = () => {
        const {PHONE_AUTHORIZATION_STEP} = this.props.userProfile.user;
        const delta = PHONE_AUTHORIZATION_STEP * 1000 - new Date().getTime();
        if (delta > 0 && isFinite(delta)) {
            const timeoutString = moment.utc(delta).format('m:ss');
            this.setState({timeoutString});
        } else {
            this.stopPhoneTimer();
            this.setState({timeoutString: ''});
        }
    };

    onItemChange = (propertyName, value) => {
        const form = {...this.state.form};
        form[propertyName] = value;
        this.setState({form});
    };

    saveUserDetails = () => {
        this.setState({isSaving: true});
        this.props.updateUserProfile(this.state.form);
    };

    changeUserPhone = () => {
        this.setState({isSaving: true});
        this.props.changeUserPhone(this.state.form);
    };

    render() {
        const {user: {phone: oldPhone, CAN_CHANGE_PHONE, NEW_PHONE_NUMBER, PHONE_AUTHORIZATION_STEP}} = this.props.userProfile;
        const {onItemChange, saveUserDetails, changeUserPhone} = this;
        const {isSaving, timeoutString, form: {phone, code}} = this.state;
        return (
            <DataSection
                title='Your Phone number'
                isSaving={isSaving}
                component={
                    <PhoneNumberSection
                        {...{
                            PHONE_AUTHORIZATION_STEP,
                            NEW_PHONE_NUMBER,
                            CAN_CHANGE_PHONE,
                            oldPhone,
                            phone,
                            code,
                            timeoutString,
                            changeUserPhone,
                            onItemChange,
                            saveUserDetails
                        }}
                    />
                }
            />
        );
    }
}

const PhoneNumberSection = ({
                                oldPhone, CAN_CHANGE_PHONE,
                                ...props
                            }) => (
    <div className='form-rows'>
        {
            oldPhone &&
            <div className='form-row column'>
                <label htmlFor='phone'>Phone Number</label>

                <div className='landspot-input'>
                    <input type='text'
                           id='phone'
                           placeholder='Phone number'
                           value={oldPhone}
                           disabled={true}
                    />
                </div>
            </div>
        }
        {
            CAN_CHANGE_PHONE
                ? <PhoneField {...props}/>
                : <div className='form-row column'>You have recently changed a phone number. You can change the phone number
                    later.</div>
        }

    </div>
);

const PhoneField = ({phone, code, NEW_PHONE_NUMBER, timeoutString, onItemChange, saveUserDetails, changeUserPhone}) => (
    timeoutString ?
        <React.Fragment>
            <div className='form-row column'>
                <p>An authorization code was send to your new phone <b>{NEW_PHONE_NUMBER}</b></p>
            </div>
            <div className='form-row column'>
                <label htmlFor='code'>Type the authorization code below</label>
                <div className='landspot-input'>
                    <input type='text'
                           value={code}
                           maxLength={6}
                           size={3}
                           placeholder='6 digit code'
                           onChange={e => onItemChange('code', e.target.value)}
                    />
                </div>
            </div>
            <div className='form-row column'>
                <p>You can request a new code in <b>{timeoutString}</b></p>
            </div>
            <button type='button'
                    className={classnames('button', code !== '' ? 'default' : '')}
                    disabled={code === ''}
                    onClick={changeUserPhone}
            >CHANGE PHONE
            </button>
        </React.Fragment>
        : <React.Fragment>
            <div className='form-row column'>
                <label>Type a new phone</label>
                <div className='landspot-input'>
                    <input type='text'
                           value={phone}
                           placeholder='Phone number'
                           onChange={e => onItemChange('phone', e.target.value)}
                    />
                </div>
            </div>
            <button type='button'
                    className={classnames('button', phone !== '' ? 'default' : '')}
                    disabled={phone === ''}
                    onClick={saveUserDetails}
            >SAVE
            </button>
        </React.Fragment>

);
export default UserPhoneNumber;