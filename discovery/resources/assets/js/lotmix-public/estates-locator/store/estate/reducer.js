import * as estateActions from './actions';
import {success, error} from '~/axios/api';
import {errorExtractor} from '~/helpers';

const initialState = Object.freeze({
    catalogue: {},
    suburbs: {},
    state:{},
    preloader: false
});

export default (state = initialState, action) => {
    switch (action.type) {
        case estateActions.GET_STATE_ESTATES:
            return {
                ...state,
                preloader: true
            };

        case success(estateActions.GET_STATE_ESTATES):
            return {
                ...state,
                ...action.payload.data,
                preloader: false
            };

        case error(estateActions.GET_STATE_ESTATES): {
            return {
                ...state,
                preloader: false,
                errors: errorExtractor(action)
            };
        }

        default: {
            return state;
        }
    }
};
