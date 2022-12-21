import * as estateActions from './actions';
import {success, error} from '~/axios/api';
import {errorExtractor} from '~/helpers';

const initialState = Object.freeze({
    estate: {},
    estateDocuments: [],
    preloader: false
});

export default (state = initialState, action) => {
    switch (action.type) {
        case estateActions.TOGGLE_LOT_TO_SHORTLIST:
        case estateActions.GET_ESTATE_INFO:
            return {...state, preloader: true};
        case success(estateActions.TOGGLE_LOT_TO_SHORTLIST):
        case success(estateActions.GET_ESTATE_INFO):
            return {...state, ...action.payload.data, preloader: false};

        case error(estateActions.TOGGLE_LOT_TO_SHORTLIST):
        case error(estateActions.GET_ESTATE_INFO): {
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
