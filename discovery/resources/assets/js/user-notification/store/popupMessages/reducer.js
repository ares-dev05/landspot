import {success} from '~/axios/api';
import * as notificationActions from '../notification/actions';

export default (state = {
    message: null
}, action) => {
    switch (action.type) {
        case success(notificationActions.SET_USER_DECISION): {
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