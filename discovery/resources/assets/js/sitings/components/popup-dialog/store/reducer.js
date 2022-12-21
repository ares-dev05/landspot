import {error, success} from '~sitings~/axios/api';
import {UPDATE_FLOORPLAN_HISTORY} from '../../builder/store/floorplans/actions';
import * as actions from './actions';
import {errorExtractor} from '~/helpers';

export default (state = {}, action) => {
    switch (action.type) {
        case success(actions.GET_FLOORPLAN_DATA):
        case success(actions.GET_FLOORPLAN_HISTORY):
        case success(actions.STORE_FLOORPLAN_FORM):
        case success(actions.GET_CLIENTS_LIST):
        case success(actions.GET_FLOORPLAN_FILES): {
            return {...state, ...action.payload.data};
        }

        case success(actions.UPDATE_FLOORPLAN): {
            const {ajaxSuccess} = action.payload.data;
            return {...state, ajaxSuccess};
        }

        case success(actions.STORE_FLOORPLAN_SVG): {
            return {...state, ...action.payload.data, ...{FLOORPLAN_SVG_UPDATED: true}};
        }

        case error(actions.GET_FLOORPLAN_HISTORY) :
        case error(actions.STORE_FLOORPLAN_FORM) :
        case error(actions.STORE_FLOORPLAN_SVG) :
        case error(actions.GET_FLOORPLAN_DATA) :
        case error(actions.GET_CLIENTS_LIST) :
        case error(actions.GET_FLOORPLAN_FILES) : {
            return {
                ...state,
                ...{
                    errors: errorExtractor(action)
                }
            };
        }

        case actions.RESET_FLOORPLAN_DATA_UPDATED: {
            const newState = {...state};
            delete newState['FLOORPLAN_DATA_UPDATED'];
            return newState;
        }

        case actions.RESET_FLOORPLAN_SVG_DATA_UPDATED: {
            const newState = {...state};
            delete newState['FLOORPLAN_SVG_UPDATED'];
            return newState;
        }

        case actions.RESET_MESSAGES: {
            const newState = {...state};
            delete newState['ajaxSuccess'];
            delete newState['errors'];
            return newState;
        }

        case actions.RESET_ERROR_MESSAGES: {
            const newState = {...state};
            delete newState.errors;
            return newState;
        }

        case actions.RESET_DIALOG_STORE: {
            return {};
        }

        case success(UPDATE_FLOORPLAN_HISTORY): {
            return state;
        }

        default:
            return state;
    }
};