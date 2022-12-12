import {error, success} from '~/axios/api';
import * as actions from './actions';

export default (state = {}, action) => {
    switch (action.type) {
        case 'RESET_PACKAGES_STORE':
            return {};

        case success(actions.LOAD_LOT_PACKAGES_FOR_VIEW): {
            return {...state, ...action.payload.data};
        }

        default:
            return state;
    }
};