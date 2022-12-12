import * as actions from './actions';
import {success, error} from '~sitings~/axios/api';
import {errorExtractor} from '~/helpers';

const initialState = {};

export default (state = initialState, action) => {

    switch (action.type) {
        case success(actions.LOAD_REF_DOC):
        case success(actions.CREATE_NEW_SITING):
        case success(actions.SITE_LOT_AGAIN):
        case success(actions.SAVE_RAW_DATA):
        case success(actions.LOAD_SITING_DRAWER):
            return {...state, ...action.payload.data, DRAWER_UPDATED: true};

        case error(actions.LOAD_REF_DOC):
        case error(actions.CREATE_NEW_SITING):
        case error(actions.SITE_LOT_AGAIN):
        case error(actions.LOAD_SITING_DRAWER):
        case error(actions.SAVE_RAW_DATA): {
            return {...state, ...{errors: errorExtractor(action)}};
        }

        case actions.RESET_DRAWER_MESSAGES: {
            const newState = {...state};
            delete newState['ajax_success'];
            delete newState['errors'];
            return newState;
        }

        case actions.RESET_DRAWER_UPDATED: {
            const newState = {...state};
            delete newState['DRAWER_UPDATED'];
            return newState;
        }

        case actions.RESET_EXPORT_COMPLETE: {
            const newState = {...state};
            delete newState['EXPORT_COMPLETE'];
            return newState;
        }

        case actions.RESET_STEP_FROM_STORE: {
            const newState = {...state};
            delete newState['nextStep'];
            return newState;
        }

        case 'EXPORT_LOT_DATA': {
            return {...state, ...action.payload.data, 'EXPORT_LOT_DATA': true};
        }

        case 'RESET_EXPORT_LOT_DATA': {
            const newState = {...state};
            delete newState['exportType'];
            delete newState['EXPORT_LOT_DATA'];
            return newState;
        }

        case 'RESET_OPEN_DIALOG': {
            const newState = {...state};
            delete newState['OPEN_DIALOG'];
            return newState;
        }
        case 'RESET_EXPORT_PDF': {
            const newState = {...state};
            delete newState['EXPORT_PDF'];
            return newState;
        }

        case actions.RESET_DRAWER_STATE:
            return initialState;

        default: {
            return state;
        }
    }

};