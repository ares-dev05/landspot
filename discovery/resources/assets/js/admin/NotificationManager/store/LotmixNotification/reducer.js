import * as estateActions from './actions';
import {success, error} from '~/axios/api';
import {errorExtractor} from '~/helpers';

export default (state = {
    lotmixNotifications: null,
    lotmixNotification: null,
    message: null,
    file: null,
    errors: null,
}, action) => {

    switch (action.type) {
        case success(estateActions.FETCH_LOTMIX_NOTIFICATIONS):
        case success(estateActions.FETCH_LOTMIX_NOTIFICATION):
        case success(estateActions.CREATE_LOTMIX_NOTIFICATION):
        case success(estateActions.EDIT_LOTMIX_NOTIFICATION):
        case success(estateActions.REMOVE_LOTMIX_NOTIFICATION):
        case success(estateActions.SEND_LOTMIX_NOTIFICATION):
            return {
                ...state,
                ...action.payload.data,
                errors: {}
            };

        case 'RESET_LOTMIX_STATE':
            return {
                lotmixNotifications: null,
                lotmixNotification: null,
                message: null,
                file: null,
            };

        case 'RESET_LOTMIX_MESSAGE':
            return {
                ...state,
                message: null,
            };

        case error(estateActions.FETCH_LOTMIX_NOTIFICATIONS):
        case error(estateActions.FETCH_LOTMIX_NOTIFICATION):
        case error(estateActions.CREATE_LOTMIX_NOTIFICATION):
        case error(estateActions.EDIT_LOTMIX_NOTIFICATION):
        case error(estateActions.REMOVE_LOTMIX_NOTIFICATION):
        case error(estateActions.SEND_LOTMIX_NOTIFICATION):
            return {...state, errors: errorExtractor(action)};
        default: {
            return state;
        }
    }
};