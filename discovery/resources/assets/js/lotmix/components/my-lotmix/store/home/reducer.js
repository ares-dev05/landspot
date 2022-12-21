import * as userActions from './actions';
import {success, error} from '~/axios/api';
import {errorExtractor} from '~/helpers';

const initialState = {
    companies: null,
    estates: null,
    relatedPosts: [],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case success(userActions.GET_USER_LOTMIX):
            return {...state, ...action.payload.data, LOTMIX_UPDATED: true};

        case error(userActions.GET_USER_LOTMIX): {
            return Object.assign({}, state, {
                errors: errorExtractor(action)
            });
        }

        case userActions.RESET_LOTMIX_MESSAGES: {
            const newState = {...state};
            delete newState.message;
            delete newState.errors;
            return newState;
        }

        case 'RESET_LOTMIX_UPDATED': {
            const newState = {...state};
            delete newState['LOTMIX_UPDATED'];
            return newState;
        }

        case userActions.RESET_LOTMIX_STORE: {
            return {...initialState};
        }

        default:
            return state;
    }
};
