import * as actions from './actions';
import {success, error} from '~/axios/api';
// import cloneDeep from 'lodash/fp/cloneDeep';

export default (state = {}, action) => {
    switch (action.type) {
        case success(actions.GET_USER_PROFILE):
        case success(actions.UPDATE_USER_PROFILE):
        case success(actions.CHANGE_USER_PHONE):
        case success(actions.AUTHORIZE_FOR_2FA):
        case success(actions.GET_2FA_CONFIG):
        case success(actions.VERIFY_OTP_CODE):
            return {...state, ...action.payload.data};

        case error(actions.GET_USER_PROFILE):
        case error(actions.UPDATE_USER_PROFILE):
        case error(actions.CHANGE_USER_PHONE):
        case error(actions.AUTHORIZE_FOR_2FA):
        case error(actions.GET_2FA_CONFIG):
        case error(actions.VERIFY_OTP_CODE):
            return {...state, ...{errors: action.payload.error.response.data.errors}};

        case 'RESET_PROFILE_MESSAGES': {
            const newState = {...state};
            delete newState.errors;
            delete newState.ajaxSuccess;
            return newState;
        }

        case 'RESET_AUTHORIZATION': {
            const newState = {...state};
            delete newState['PASSWORD_AUTHORIZED'];
            return newState;
        }


        case 'CLEAN_USER_PROFILE_STORE':
            return {};

        default:
            return state;
    }
};