import * as estateActions from './actions';
import {success, error} from '~/axios/api';
import {errorExtractor} from '~/helpers';

const initialState = Object.freeze({
    estate: null,
    stages: null,
    columns: null,
    preloader: false
});

export default (state = initialState, action) => {

    switch (action.type) {
        case estateActions.SWITCH_LOT_TO_SHORTLIST :
        case estateActions.GET_ESTATE_LOTS :
            return {...state, preloader: true};
        case success(estateActions.SWITCH_LOT_TO_SHORTLIST):
        case success(estateActions.GET_ESTATE_LOTS):
            return {...state,
                ...action.payload.data,
                preloader: false
            };

        case estateActions.RESET_POPUP_MESSAGES: {
            const newState = {...state};
            delete newState['ajax_success'];
            delete newState['errors'];
            return newState;
        }

        case 'RESET_ESTATE_UPDATED': {
            const newState = {...state};
            delete newState['ESTATE_UPDATED'];
            return newState;
        }

        case error(estateActions.SWITCH_LOT_TO_SHORTLIST):
        case error(estateActions.GET_ESTATE_LOTS): {
            return Object.assign({}, state, {errors: errorExtractor(action)});
        }

        case estateActions.RESET_ESTATE_DATA:
            return initialState;

        default: {
            return state;
        }
    }

};