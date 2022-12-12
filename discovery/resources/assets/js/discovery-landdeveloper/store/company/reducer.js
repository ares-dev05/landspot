import {FILTER_COMPANY_HOUSES} from '../catalogue/actions';
import * as companyActions from './actions';
import {success, error} from '~/axios/api';

const initialState = Object.freeze({
    houses: null,
    filters: null,
});

export default (state = initialState, action) => {
    switch (action.type) {
        case success(FILTER_COMPANY_HOUSES):
            return {...state, ...action.payload.data};

        case error(FILTER_COMPANY_HOUSES):
            return state;

        case companyActions.RESET_COMPANY_DATA:
             return initialState;

        default:
            return state;
    }
};