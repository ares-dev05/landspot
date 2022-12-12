import * as actions from '../popupDialog/actions';
import * as catalogueActions from './actions';
import {success, error} from '~/axios/api';

const initialState = Object.freeze({
    estates: null,
    filters: null,
    basePath: '/landspot/my-estates'
});

export default (state = initialState, action) => {

    switch (action.type) {
        case success(catalogueActions.FILTER_ESTATE_LIST): {
            return Object.assign({}, state, action.payload.data);
        }
        case error(catalogueActions.FILTER_ESTATE_LIST): {
            return state;
        }

        case success(actions.ADD_ESTATE): {
            const newState = {...state};
            newState.ADDED_NEW_ESTATE = 'ADDED_NEW_ESTATE';
            return newState;
        }

        case 'RESET_NEW_ESTATE_MSG': {
            const newState = {...state};
            delete  newState.ADDED_NEW_ESTATE;
            return newState;
        }

        default: {
            return state;
        }
    }

};