import * as actions from '../popupDialog/actions';
import {success, error} from '~/axios/api';
import {errorExtractor} from '~/helpers';

export default (state = {}, action) => {
    switch (action.type) {
        case actions.RESET_DIALOG_STORE:
            return {};

        case success(actions.SAVE_PERMISSIONS):
            return Object.assign({}, state, action.payload.data);

        case error(actions.SAVE_PERMISSIONS): {
            return Object.assign({}, state, {errors: errorExtractor(action)});
        }

        case 'RESET_POPUP_MESSAGES': {
            const newState = {...state};
            delete newState.errors;
            return newState;
        }

        default:
            return state;
    }
};