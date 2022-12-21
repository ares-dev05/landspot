import {success, error} from '~/axios/api';
import * as actions from '../popupDialog/actions';
import * as managerActions from '../manager/actions';
import {errorExtractor} from '~/helpers';

const initialState = {
    fetch: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case success(actions.GET_HOUSE_DETAILS):
        case success(actions.UPDATE_HOUSE_MEDIA):
        case success(actions.SAVE_HOUSE_DETAILS):
        case success(actions.REMOVE_HOUSE_MEDIA):
        case success(actions.SAVE_RANGE_INCLUSIONS):
        case success(actions.GET_HOUSE_MEDIA):
        case success(actions.SAVE_HOUSE):
        case success(actions.SET_COMPANY_PROFILE_DATA):
            return {...state, ...action.payload.data, fetch: true};

        case error(actions.SAVE_HOUSE_DETAILS):
        case error(actions.UPDATE_HOUSE_MEDIA):
        case error(actions.GET_HOUSE_MEDIA):
        case error(actions.REMOVE_HOUSE_MEDIA):
        case error(actions.SAVE_RANGE_INCLUSIONS):
        case error(actions.SAVE_HOUSE):
        case error(actions.GET_HOUSE_DETAILS):
        case error(actions.SET_COMPANY_PROFILE_DATA): {
            return {...state, ...{errors: errorExtractor(action)}};
        }

        case actions.RESET_DIALOG_STORE:
            return initialState;

        case 'RESET_POPUP_FETCH_FLAG': {
            const newState = {...state};
            newState['fetch'] = false;
            return newState;
        }

        case managerActions.RESET_POPUP_MESSAGES: {
            const newState = {...state, fetch: true};
            delete newState['ajax_success'];
            delete newState['errors'];
            return newState;
        }

        default:
            return state;
    }
};