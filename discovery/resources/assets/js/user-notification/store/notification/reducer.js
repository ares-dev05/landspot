import {error, success} from '~/axios/api';
import * as notificationActions from './actions';
import {errorExtractor} from '~/helpers';

export default (state = {
    user: null,
}, action) => {
    switch (action.type) {
        case success(notificationActions.GET_USER_NOTIFICATIONS):
        case success(notificationActions.SET_USER_DECISION):
        case success(notificationActions.CLOSE_NOTIFICATION):
        case success(notificationActions.ACCEPT_TOS):
            return Object.assign({}, state, action.payload.data);

        case error(notificationActions.GET_USER_NOTIFICATIONS):
        case error(notificationActions.SET_USER_DECISION):
        case error(notificationActions.CLOSE_NOTIFICATION):
        case error(notificationActions.ACCEPT_TOS):
            return Object.assign({}, state, {
                errors: errorExtractor(action)
            });

        case notificationActions.RESET_MESSAGES :
            // eslint-disable-next-line no-case-declarations
            const newState = {...state};
            delete newState['errors'];
            return newState;

        case 'CLEAR_TOS': {
            const newState = {...state};
            delete newState['tosText'];
            return newState;
        }

        default:
            return state;
    }
};