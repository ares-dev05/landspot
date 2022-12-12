import {error, success} from '~/axios/api';
import * as actions from './actions';

const initialState = Object.freeze({
    companies: null,
});

export default (state = initialState, action) => {
    switch (action.type) {
        case success(actions.GET_COMPANIES):
            return {...state, ...action.payload.data};

        case error(actions.GET_COMPANIES):
            return state;

        case 'RESET_COMPANIES_STATE':
            return {...initialState};

        default:
            return state;
    }
};