import * as catalogueActions from './actions';
import {success, error} from '~/axios/api';

export default (state = {
    companies: null,
    user: {},
    basePath: '/landspot/pdf-manager'
}, action) => {
    switch (action.type) {
        case success(catalogueActions.NEW_COMPANIES_CATALOGUE):
        case success(catalogueActions.FILTER_COMPANIES_CATALOGUE):
        case success(catalogueActions.GET_USER):
            return Object.assign({}, state, action.payload.data);

        case error(catalogueActions.NEW_COMPANIES_CATALOGUE):
        case error(catalogueActions.FILTER_COMPANIES_CATALOGUE):
        case error(catalogueActions.GET_USER):
            return state;

        default:
            return state;
    }
};