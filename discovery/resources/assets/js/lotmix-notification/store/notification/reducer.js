import {error, success} from '~/axios/api';
import * as notificationActions from './actions';
import {errorExtractor} from '~/helpers';

export default (state = {
    lotmixNotifications: [],
}, action) => {
    switch (action.type) {
        case success(notificationActions.GET_LOTMIX_NOTIFICATIONS):
        case success(notificationActions.CLOSE_LOTMIX_NOTIFICATION):
            return {...state, ...action.payload.data};
        case error(notificationActions.GET_LOTMIX_NOTIFICATIONS):
        case error(notificationActions.CLOSE_LOTMIX_NOTIFICATION):
            return {
                ...state,
                errors: errorExtractor(action)
            };
        default:
            return state;
    }
};