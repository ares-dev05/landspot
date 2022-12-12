import {error, success} from '~/axios/api';
import * as actions from './actions';

const initialState = Object.freeze({estates: null});

export default (state = initialState, action) => {
    switch (action.type) {
        case success(actions.GET_ESTATES):
            return {...state, ...action.payload.data, ...{ESTATES_UPDATED: true}};

        case error(actions.GET_ESTATES): {
            const newState = {...state};
            newState.ESTATES_UPDATED = true;
            return newState;
        }

        case actions.RESET_PRELOADER: {
            const newState = {...state};
            delete newState['ESTATES_UPDATED'];
            return newState;
        }

        case actions.RESET_COMPANY_STATE:
            return {...initialState};

        default:
            return state;
    }
};