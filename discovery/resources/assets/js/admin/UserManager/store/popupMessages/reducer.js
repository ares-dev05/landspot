import * as estateActions from '../users/actions';
import {success} from '~/axios/api';

export default (state = {
    message: null
}, action) => {
    switch (action.type) {
        case success(estateActions.SEND_RESET_PASSWORD_LINK):
        case success(estateActions.UPDATE_USER):
        case success(estateActions.REMOVE_USER):
        case success(estateActions.RESTORE_USER):
        case success(estateActions.ADD_USER):
        case success(estateActions.SEND_SUPPORT_REQUEST):
        case success(estateActions.RESET_USER_2FA):
        case success(estateActions.CLOSE_ACCESS_REQUEST): {
            const {message} = action.payload.data;
            if (message) {
                return Object.assign({}, state, {message});
            } else {
                return state;
            }
        }

        case 'RESET_MESSAGE':
            return {
                message: null
            };
        default:
            return state;
    }
};