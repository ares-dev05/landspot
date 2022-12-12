import * as estateActions from './actions';
import {success, error} from '~/axios/api';
import {errorExtractor} from '~/helpers';

const initialState = {
    estate: null,
    lot: null,
    lotData: null,
    pos: null
};

export default (state = initialState, action) => {

    switch (action.type) {
        case success(estateActions.GET_ESTATE_DATA):
        case success(estateActions.LOAD_POS):
        case success(estateActions.LOAD_LOT_RAW_DATA):
        case success(estateActions.LOAD_LOT_SETTINGS):
            return Object.assign({}, state, action.payload.data, {DRAWER_UPDATED: true});

        case success(estateActions.SAVE_LOT_RAW_DATA):{
            const newState = Object.assign({}, state, action.payload.data, {DRAWER_UPDATED: true});
            if (action.payload.data.nextStep === undefined){
                newState['EXPORT_COMPLETE'] = true;
            }
            return newState;
        }

        case error(estateActions.GET_ESTATE_DATA):
        case error(estateActions.LOAD_POS):
        case error(estateActions.LOAD_LOT_RAW_DATA):
        case error(estateActions.SAVE_LOT_RAW_DATA):
        case error(estateActions.LOAD_LOT_SETTINGS): {
            return Object.assign({}, state, {errors: errorExtractor(action)});
        }

        case 'RESET_DRAWER_MESSAGES': {
            const newState = {...state};
            delete newState['ajax_success'];
            delete newState['errors'];
            return newState;
        }

        case 'RESET_DRAWER_UPDATED': {
            const newState = {...state};
            delete newState['DRAWER_UPDATED'];
            return newState;
        }

        case 'RESET_EXPORT_COMPLETE': {
            const newState = {...state};
            delete newState['EXPORT_COMPLETE'];
            return newState;
        }

        case 'RESET_STEP_FROM_STORE': {
            const newState = {...state};
            delete newState['nextStep'];
            return newState;
        }

        case 'EXPORT_LOT_DATA': {
            const newState = {...state};
            newState['EXPORT_LOT_DATA'] = true;
            return newState;
        }

        case 'RESET_EXPORT_LOT_DATA': {
            const newState = {...state};
            delete newState['EXPORT_LOT_DATA'];
            return newState;
        }

        case 'RESET_DRAWER_STATE':
            return initialState;

        default: {
            return state;
        }
    }

};