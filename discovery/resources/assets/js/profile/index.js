import React, {Component} from 'react';
import {connect} from 'react-redux';
import store from './store';
import * as actions from './store/userProfile/actions';
import PropTypes from 'prop-types';
import * as Components from './components';
import {withAlert} from 'react-alert';
import {ContentPanel} from '../helpers/Panels';

class UserProfile extends Component {

    static propTypes = {
        getUserProfile: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        this.props.getUserProfile();
    }

    componentWillUnmount() {
        store.dispatch({type: 'CLEAN_USER_PROFILE_STORE'});
    }

    componentDidUpdate() {
        const {userProfile: {errors, ajaxSuccess, ajaxError}, alert: {show}} = this.props;
        if (errors && Object.keys(errors).length) {
            let errorMsgs = Object.keys(errors).map(key => {
                return errors[key].toString();
            });

            if (errorMsgs.length) {
                this.showErrors(errorMsgs);
            }
        }

        if (ajaxSuccess) {
            show(ajaxSuccess, {
                type: 'success',
            });
        }

        if (ajaxError) {
            show(ajaxError, {
                type: 'error',
            });
        }

        if (ajaxSuccess || ajaxError || errors) {
            store.dispatch({type: 'RESET_PROFILE_MESSAGES'});
        }
    }

    showErrors = (errors) => {
        let errorMsgs = errors.map((item, index) => <div key={index}>{item}</div>);

        this.props.alert.show(
            errorMsgs,
            {
                type: 'error',
            }
        );
    };

    render = () => (
        this.props.userProfile.user
            ? <ContentPanel className="user-profile">
                <header>Profile</header>
                <Components.UserNameAvatar {...this.props}/>
                {/*<Components.UserPhoneNumber {...this.props}/>*/}
                <Components.TwoFactorAuthentication {...this.props}/>
            </ContentPanel>
            : null
    );
}


export default withAlert(connect((state => state), actions)(UserProfile));