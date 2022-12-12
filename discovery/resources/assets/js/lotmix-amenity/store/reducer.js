import * as estateActions from './actions';
import {success, error} from '~/axios/api';
import {errorExtractor} from '~/helpers';

const initialState = Object.freeze({
    estate: {},
    preloader: false
});

export default (state = initialState, action) => {
    switch (action.type) {
        case estateActions.GET_ESTATE:
            return {
                ...state,
                preloader: true
            };

        case success(estateActions.GET_ESTATE):
            return {
                ...state,
                ...action.payload.data,
                preloader: false
            };

        case error(estateActions.GET_ESTATE): {
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
