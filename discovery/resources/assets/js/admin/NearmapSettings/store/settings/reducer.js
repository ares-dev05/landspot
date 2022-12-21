import * as actions from './actions';
import {success, error} from '~/axios/api';
import {errorExtractor} from '~/helpers';

const initialState = Object.freeze({
    nearmapSettings: null
});

export default (state = initialState, action) => {
    switch (action.type) {
        case success(actions.GET_SETTINGS):
        case success(actions.UPDATE_SETTINGS):
            return {...state, ...action.payload.data, ...{DATA_UPDATED: true}};

        case error(actions.GET_SETTINGS):
        case error(actions.UPDATE_SETTINGS): {
            return {...state, ...{errors: errorExtractor(action)}};
        }

        case actions.RESET_STORE:
            return initialState;

        case actions.RESET_DATA_UPDATED: {
            const newState = {...state};
            delete newState['DATA_UPDATED'];
            return newState;
        }

        default: {
            return state;
        }
    }
};