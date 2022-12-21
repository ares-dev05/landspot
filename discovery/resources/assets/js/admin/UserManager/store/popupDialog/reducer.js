import {success, error} from '~/axios/api';
import * as actions from '../popupDialog/actions';
import {errorExtractor} from '~/helpers';

export default (state = {}, action) => {
    switch (action.type) {
        case actions.RESET_DIALOG_STORE:
            return {};

        case success(actions.LOAD_ESTATES_WITH_USER_PERMISSIONS):
        case success(actions.SAVE_PERMISSIONS):
        case success(actions.SAVE_SALES_LOCATIONS):
        case success(actions.SAVE_LOTMIX_SETTINGS):
        case success(actions.GET_COMPANY_DATA):
            return Object.assign({}, state, action.payload.data);

        case error(actions.SAVE_SALES_LOCATIONS):
        case error(actions.SAVE_LOTMIX_SETTINGS):
            return Object.assign({}, state, {
                errors: errorExtractor(action)
            });

        default:
            return state;
    }
};