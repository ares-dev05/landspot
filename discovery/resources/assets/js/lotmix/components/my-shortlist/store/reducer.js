import * as userActions from './actions';
import {success, error} from '~/axios/api';
import {errorExtractor} from '~/helpers';

const initialState = {
    companies: null,
    estates: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case success(userActions.GET_SHORTLIST_DATA):
            return {...state, ...action.payload.data, SHORTLIST_UPDATED: true};

        case error(userActions.GET_SHORTLIST_DATA): {
            return Object.assign({}, state, {
                errors: errorExtractor(action)
            });
        }

        default:
            return state;
    }
};
