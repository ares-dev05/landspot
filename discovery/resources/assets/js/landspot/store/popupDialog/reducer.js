import {error, success} from '~/axios/api';
import {ADD_STAGE, UPDATE_ESTATE, UPDATE_STAGE} from '../estate/actions';
import * as actions from '../popupDialog/actions';

export default (state = {}, action) => {
    switch (action.type) {
        case actions.RESET_DIALOG_STORE:
            return {};

        case success(actions.LOAD_LOT_VISIBILITY):
        case success(actions.LOAD_LOT_PACKAGES):
        case success(actions.LOAD_LOT_PACKAGES_FOR_UPLOAD):
        case success(actions.LOAD_ESTATE_DOCUMENTS):
        case success(actions.LOAD_PDF_TEMPLATE):
        case success(actions.UPDATE_PDF_TEMPLATE):
        case success(actions.UPDATE_LOT_PACKAGES):
            return Object.assign({}, state, action.payload.data);

        case success(actions.ADD_ESTATE): {
            const newState = {...state};
            newState.ADDED_NEW_ESTATE = 'ADDED_NEW_ESTATE';
            return newState;
        }

        case actions.UPDATE_ESTATE_DOCUMENTS: {
            return {...state, ...action.payload.data};
        }

        case success(ADD_STAGE):
        case success(UPDATE_STAGE):
        case success(UPDATE_ESTATE): {
            const newState = {...state};
            newState.ESTATE_UPDATED = 'ESTATE_UPDATED';
            return newState;
        }

        case 'RESET_ESTATE_UPDATED': {
            const newState = {...state};
            delete newState['ESTATE_UPDATED'];
            return newState;
        }

        case success(actions.DELETE_ESTATE_PACKAGE): {
            const newState = {...state, ...action.payload.data};
            newState.PACKAGE_DELETED = true;
            return newState;
        }

        case actions.RESET_DIALOG_MESSAGES: {
            const newState = {...state};
            delete newState.PACKAGE_DELETED;
            delete newState.UPDATED_ESTATE_PACKAGES;
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