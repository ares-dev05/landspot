import {error, success} from '~/axios/api';
import * as actions from '../popupDialog/actions';

export default (state = {}, action) => {
    switch (action.type) {
        case success(actions.GET_LOT_DRAWER_DATA):
            return Object.assign({}, state, {...action.payload.data, POPUP_UPDATED: true});

        case actions.RESET_DIALOG_STORE:
            return {};

        case 'RESET_POPUP_UPDATED': {
            const newState = {...state};
            delete newState['POPUP_UPDATED'];
            return newState;
        }

        default:
            return state;
    }
};