import {STORE_FLOORPLAN_FORM} from '../../../popup-dialog/store/actions';
import {UPDATE_FLOORPLAN_HISTORY} from './actions';
import * as actions from './actions';
import {success, error} from '~sitings~/axios/api';
import {errorExtractor} from '~/helpers';

const initialState = {
    floorPlans: null,
    companies: null,
    ranges: null,
    floorplan: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case success(actions.GET_FLOORPLANS):
        case success(actions.DELETE_FLOORPLAN):
        case success(UPDATE_FLOORPLAN_HISTORY):
        case success(actions.UPDATE_FLOORPLAN): {
            return {...state, ...action.payload.data, ...{DATA_UPDATED: true}};
        }

        case success(STORE_FLOORPLAN_FORM): {
            return {...state, ...{FLOORPLANS_UPDATED: true}};
        }


        //eslint-disable-next-line no-fallthrough
        case error(actions.GET_FLOORPLANS):
        case error(actions.DELETE_FLOORPLAN):
        case error(actions.UPDATE_FLOORPLAN): {
            return {
                ...state,
                ...{
                    errors: errorExtractor(action)
                }
            };
        }
        case actions.RESET_MESSAGES :
            // eslint-disable-next-line no-case-declarations
            const newState = {...state};
            delete newState['errors'];
            return newState;


        case actions.RESET_FLOORPLANS_STORE: {
            return {...state, ...initialState};
        }

        case actions.RESET_DATA_UPDATED: {
            const newState = {...state};
            delete newState['DATA_UPDATED'];
            delete newState['FLOORPLANS_UPDATED'];
            return newState;
        }

        default:
            return state;
    }
};