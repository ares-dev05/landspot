import {UPDATE_COMPANY} from '../catalogue/actions';
import * as estateActions from './actions';
import * as popupActions from '../popupDialog/actions';
import {success, error} from '~/axios/api';
import cloneDeep from 'lodash/fp/cloneDeep';
import {errorExtractor} from '~/helpers';

const initialState = {
    users: [],
    company: null,
    states: [],
    errors: null
};

export default (state = initialState, action) => {

    switch (action.type) {
        case success(estateActions.FILTER_USERS_LIST):
        case success(estateActions.ADD_USER):
        case success(estateActions.UPDATE_USER):
        case success(estateActions.REMOVE_USER):
        case success(estateActions.RESTORE_USER):
        case success(estateActions.RESET_USER_2FA):
        case success(estateActions.SEND_SUPPORT_REQUEST):
        case success(estateActions.CLOSE_ACCESS_REQUEST):
        case success(popupActions.SAVE_LOTMIX_SETTINGS):
            return Object.assign({}, state, action.payload.data);

        case success(UPDATE_COMPANY): {
            let newState = cloneDeep(state);
            Object.assign(newState.company, action.payload.data);
            return newState;
        }

        case error(estateActions.FILTER_USERS_LIST):
        case error(estateActions.ADD_USER):
        case error(estateActions.UPDATE_USER):
        case error(estateActions.REMOVE_USER):
        case error(estateActions.RESTORE_USER):
        case error(estateActions.SEND_SUPPORT_REQUEST):
        case error(estateActions.RESET_USER_2FA):
        case error(estateActions.CLOSE_ACCESS_REQUEST): {
            return Object.assign({}, state, {errors: errorExtractor(action)});
        }

        case 'RESET_NOTIFICATION_MESSAGES': {
            const newState = {...state};
            delete newState['ajax_success'];
            delete newState['errors'];
            return newState;
        }

        case 'RESET_USERS_UPDATED': {
            const newState = {...state};
            delete newState['USERS_UPDATED'];
            return newState;
        }

        case 'RESET_USERS_STATE':
            return initialState;

        default: {
            return state;
        }
    }

};