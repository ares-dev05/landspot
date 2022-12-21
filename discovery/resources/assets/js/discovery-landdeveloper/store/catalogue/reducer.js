import * as catalogueActions from './actions';
import {success, error} from '~/axios/api';

export default (state = {
    companies: null,
    filters: {},
    basePath: '/landspot/discovery'
}, action) => {
    switch (action.type) {
        case success(catalogueActions.FILTER_COMPANIES_CATALOGUE):
            return Object.assign({}, state, action.payload.data);

        case error(catalogueActions.FILTER_COMPANIES_CATALOGUE):
            return state;

        default:
            return state;
    }
};