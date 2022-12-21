import * as userActions from './actions';
import {success, error} from '~/axios/api';
import {errorExtractor} from '~/helpers';

const initialState = {
    company: null,
    houses: [],
    documents: [],
    sitings: []
};

export default (state = initialState, action) => {
    switch (action.type) {
        case success(userActions.GET_COMPANY_DATA):
            return {...state, ...action.payload.data, COMPANY_UPDATED: true};

        case error(userActions.GET_COMPANY_DATA): {
            return Object.assign({}, state, {errors: errorExtractor(action)});
        }

        case userActions.RESET_COMPANY_MESSAGES: {
            const newState = {...state};
            delete newState.message;
            delete newState.errors;
            return newState;
        }

        case 'RESET_COMPANY_UPDATED': {
            const newState = {...state};
            delete newState['COMPANY_UPDATED'];
            return newState;
        }

        case userActions.RESET_COMPANY_STORE: {
            return {...initialState};
        }

        default:
            return state;
    }
};