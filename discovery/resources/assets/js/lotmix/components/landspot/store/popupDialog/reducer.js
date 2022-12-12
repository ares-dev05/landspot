import {error, success} from '~/axios/api';
import * as actions from '../popupDialog/actions';

export default (state = {}, action) => {
    switch (action.type) {
        case actions.RESET_DIALOG_STORE:
            return {};

        case success(actions.LOAD_LOT_VISIBILITY):
            return Object.assign({}, state, action.payload.data);

        case 'RESET_ESTATE_UPDATED': {
            const newState = {...state};
            delete newState['ESTATE_UPDATED'];
            return newState;
        }

        case actions.RESET_DIALOG_MESSAGES: {
            const newState = {...state};
            delete newState.PACKAGE_DELETED;
            return newState;
        }

        case 'RESET_POPUP_MESSAGES': {
            let newState = {...state};
            delete newState.ajax_success;
            return newState;
        }

        case 'RESET_POPUP_FETCH_FLAG': {
            const newState = {...state};
            newState['fetch'] = false;
            return newState;
        }

        default:
            return state;
    }
};