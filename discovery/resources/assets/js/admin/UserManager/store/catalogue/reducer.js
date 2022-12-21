import {error, success} from '~/axios/api';
import * as catalogueActions from './actions';

const initialState = {
    companies: null,
    user: {},
};

export default (state = initialState, action) => {
    switch (action.type) {
        case success(catalogueActions.NEW_COMPANIES_CATALOGUE):
        case success(catalogueActions.FILTER_COMPANIES_CATALOGUE):
        case success(catalogueActions.GET_USER):
        case success(catalogueActions.ADD_COMPANY):
            return Object.assign({}, state, action.payload.data);

        case error(catalogueActions.NEW_COMPANIES_CATALOGUE):
        case error(catalogueActions.FILTER_COMPANIES_CATALOGUE):
        case error(catalogueActions.GET_USER):
        case error(catalogueActions.ADD_COMPANY):
            return state;

        case 'RESET_COMPANIES_UPDATED': {
            const newState = {...state};
            delete newState['COMPANIES_UPDATED'];
            return newState;
        }

        case 'RESET_COMPANIES_STATE':
            return {...initialState, user: state.user};

        default:
            return state;
    }
};