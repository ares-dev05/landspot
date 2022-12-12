import * as managerActions from './actions';
import {success, error} from '~/axios/api';
import * as dialogActions from '../popupDialog/actions';
import {errorExtractor} from '~/helpers';

const initialState = {
    houses: null,
    company: null,
    sortable: null,
    titleOrder: null,
    userRanges: null,
    currentRange: null,
    fetch: false
};

export default (state = initialState, action) => {
    switch (action.type) {
        case success(managerActions.GET_HOUSES):
        case success(managerActions.REMOVE_HOUSE):
        case success(managerActions.REMOVE_RANGE):
        case success(managerActions.UPDATE_HOUSE_DISCOVERY):
        case success(dialogActions.SET_COMPANY_PROFILE_DATA):
            return {...state, ...action.payload.data, fetch: true};

        case error(managerActions.GET_HOUSES):
        case error(managerActions.REMOVE_HOUSE):
        case error(managerActions.REMOVE_RANGE):
        case error(managerActions.UPDATE_HOUSE_DISCOVERY): {
            return Object.assign({}, state, {
                errors: errorExtractor(action)
            });
        }

        case managerActions.RESET_POPUP_MESSAGES: {
            const newState = {...state};
            delete newState['ajax_success'];
            delete newState['errors'];
            return newState;
        }

        case 'RESET_FETCH_FLAG': {
            return {...state, fetch: false};
        }

        case managerActions.RESET_MANAGER_DATA:
            return initialState;

        default: {
            return state;
        }
    }
};
