import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {isEqual} from 'lodash';
import DataSection from '~/helpers/DataSection';

class UserNameAvatar extends Component {

    static propTypes = {
        updateUserProfile: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            isSaving: false,
            form: {}
        };
    }

    copyPropsToState = (props) => {
        const form = {...this.state.form};
        const {display_name, email} = props.userProfile.user;
        this.setState({form: {...form, ...{display_name, email}}});
    };

    componentDidMount() {
        this.copyPropsToState(this.props);
    }

    componentDidUpdate(prevProps, prevState) {
        const {isSaving} = this.state;
        const {user} = this.props.userProfile;
        const {user: prevUser} = prevProps.userProfile;

        if (!isEqual(user, prevUser)) {
            this.copyPropsToState(this.props);
        }

        if (isSaving && isSaving === prevState.isSaving) {
            this.setState({isSaving: false});
        }
    }

    onItemChange = (propertyName, value) => {
        const form = {...this.state.form};
        form[propertyName] = value;
        this.setState({form});
    };

    saveUserDetails = () => {
        this.setState({isSaving: true});
        this.props.updateUserProfile(this.state.form);
    };

    render() {
        const {display_name, email} = this.state.form;
        const {onItemChange, saveUserDetails} = this;
        const {isSaving} = this.state;
        return (
            <DataSection
                title='Your name and email'
                isSaving={isSaving}
                component={
                    <UserNameAvatarSection
                        {...{display_name, email, onItemChange, saveUserDetails}}
                    />
                }
            />
        );
    }
}

const UserNameAvatarSection = ({display_name, email, onItemChange, saveUserDetails}) => (
    <div className='form-rows'>
        <div className='form-row column'>
            <label htmlFor="display_name">Full Name</label>
            {display_name !== undefined &&
            <div className='landspot-input'>
                <input type='text'
                       id='display_name'
                       placeholder='Full Name'
                       disabled={true}
                       value={display_name}
                       onChange={e => onItemChange('display_name', e.target.value)}
                />
            </div>
            }
        </div>
        <div className='form-row column'>
            <label htmlFor='email'>Email</label>
            {email !== undefined &&
            <div className='landspot-input'>
                <input type='text'
                       value={email}
                       id='email'
                       disabled={true}
                       placeholder='Email'
                       onChange={e => onItemChange('email', e.target.value)}
                />
            </div>
            }
        </div>
        <p>Please contact your company manager to change name, phone or email.</p>
        {/*<button type='button'*/}
                {/*className='button primary'*/}
                {/*onClick={saveUserDetails}*/}
        {/*>SAVE*/}
        {/*</button>*/}
    </div>
);

export default UserNameAvatar;