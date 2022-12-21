import * as catalogueActions from './actions';
import {success, error} from '~/axios/api';

const initialState = Object.freeze({
    estates: null,
    filters: null,
    basePath: '/land-for-sale/communities/'
});

export default (state = initialState, action) => {
    switch (action.type) {
        case success(catalogueActions.FILTER_ESTATE_LIST): {
            return Object.assign({}, state, action.payload.data);
        }
        case error(catalogueActions.FILTER_ESTATE_LIST): {
            return state;
        }

        case 'RESET_NEW_ESTATE_MSG': {
            const newState = {...state};
            delete  newState.ADDED_NEW_ESTATE;
            return newState;
        }

        default: {
            return state;
        }
    }
};