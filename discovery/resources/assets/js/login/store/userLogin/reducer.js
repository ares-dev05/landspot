import {LOGIN_STEP_OTP_APP} from '../../index';
import * as actions from './actions';
import {success, error} from '~/axios/api';

export default (state = {}, action) => {
    switch (action.type) {
        case success(actions.GET_LOGIN_CONFIG):
        case success(actions.AUTHORIZE_USER):
        case success(actions.SEND_AUTH_SMS):
            return {...state, ...action.payload.data};

        case error(actions.GET_LOGIN_CONFIG):
        case error(actions.AUTHORIZE_USER):
        case error(actions.SEND_AUTH_SMS):
            return {...state, ...{errors: action.payload.error.response.data.errors}};

        case 'RESET_LOGIN_ERRORS': {
            let newState = {...state};
            delete newState.errors;
            return newState;
        }

        case 'ACTIVATE_SMS_LOGIN': {
            let newState = {...state};
            newState.SMS_LOGIN_DISABLED = false;
            return newState;
        }

        case 'ACTIVATE_APP_LOGIN': {
            let newState = {...state};
            newState.OTP_STEP = LOGIN_STEP_OTP_APP;
            return newState;
        }

        case 'CLEAN_LOGIN_STORE':
            return {};

        default:
            return state;
    }
};