import {/*error,*/ success} from '~sitings~/axios/api';
import {GET_FLOORPLAN_DATA} from '../../../popup-dialog/store/actions';
import {UPDATE_FLOORPLAN_HISTORY} from '../floorplans/actions';
import * as actions from './actions';

const defaultState = Object.freeze({
    states: null,
    ranges: null
});

export default (state = defaultState, action) => {
    switch (action.type) {
        case success(actions.EDIT_FLOORPLAN_FORM):
        case success(UPDATE_FLOORPLAN_HISTORY): {
            return {...state, ...action.payload.data, ...{FLOORPLAN_DATA_UPDATED: true}};
        }

        case success(GET_FLOORPLAN_DATA): {
            return {...state, ...action.payload.data};
        }

        case actions.RESET_FORM_STORE: {
            return {...defaultState};
        }

        case actions.RESET_FLOORPLAN_DATA_UPDATED: {
            const newState = {...state};
            delete newState['FLOORPLAN_DATA_UPDATED'];
            return newState;
        }

        case actions.RESET_MESSAGES: {
            const newState = {...state};
            delete newState['ajaxSuccess'];
            delete newState['errors'];
            return newState;
        }

        default:
            return state;
    }
};