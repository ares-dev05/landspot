import * as estateActions from './actions';
import {success, error} from '~/axios/api';
import {errorExtractor} from '~/helpers';

export default (state = {
    users: [],
    estates: null,
    company: {},
    errors: {},
}, action) => {

    switch (action.type) {
        case success(estateActions.FILTER_USERS_LIST):
        case success(estateActions.REMOVE_USER):
            return Object.assign({}, state, {...action.payload.data, errors: {}});

        case error(estateActions.FILTER_USERS_LIST):
        case error(estateActions.REMOVE_USER): {
            return Object.assign({}, state, {errors: errorExtractor(action)});
        }

        case 'RESET_NOTIFICATION_MESSAGES': {
            const newState = {...state};
            newState.errors = {};
            return newState;
        }

        case estateActions.RESET_COMPANY_STORE : {
            const newState = {...state};
            newState.estates = null;
            return newState;
        }


        default: {
            return state;
        }
    }

};