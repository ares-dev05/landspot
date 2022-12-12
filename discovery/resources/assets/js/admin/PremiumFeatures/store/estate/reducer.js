import {error, success} from '~/axios/api';
import * as actions from './actions';

const initialState = Object.freeze({
    features: null,
    availableFeatures: null,
});

export default (state = initialState, action) => {
    switch (action.type) {
        case success(actions.GET_FEATURES):
        case success(actions.UPDATE_FEATURE):
            return {...state, ...action.payload.data, ...{FEATURES_UPDATED: true}};

        case error(actions.GET_FEATURES):
        case error(actions.UPDATE_FEATURE): {
            const newState = {...state};
            newState.FEATURES_UPDATED = true;
            return newState;
        }

        case actions.RESET_ESTATE_PRELOADER: {
            const newState = {...state};
            delete newState['FEATURES_UPDATED'];
            return newState;
        }

        case actions.RESET_ESTATE_STATE:
            return {...initialState};

        default:
            return state;
    }
};