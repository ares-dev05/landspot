import * as estateActions from './actions';
import {success, error} from '~/axios/api';

export default (state = {
    featureNotifications: null,
    featureNotification: null,
    companies: null,
    message: null,
    file: null,
    errors: null,
}, action) => {

    switch (action.type) {
        case success(estateActions.FETCH_COMPANIES):
        case success(estateActions.FETCH_FEATURE_NOTIFICATIONS):
        case success(estateActions.FETCH_FEATURE_NOTIFICATION):
        case success(estateActions.CREATE_FEATURE_NOTIFICATION):
        case success(estateActions.EDIT_FEATURE_NOTIFICATION):
        case success(estateActions.REMOVE_FEATURE_NOTIFICATION):
        case success(estateActions.SEND_FEATURE_NOTIFICATION):
            return Object.assign({}, state, {...action.payload.data, errors: {}});

        case 'RESET_STATE':
            return {
                featureNotifications: null,
                featureNotification: null,
                companies: null,
                message: null,
                file: null,
            };

        case 'RESET_MESSAGE':
            return {
                ...state,
                message: null,
            };

        case error(estateActions.FETCH_COMPANIES):
        case error(estateActions.FETCH_FEATURE_NOTIFICATIONS):
        case error(estateActions.FETCH_FEATURE_NOTIFICATION):
        case error(estateActions.CREATE_FEATURE_NOTIFICATION):
        case error(estateActions.EDIT_FEATURE_NOTIFICATION):
        case error(estateActions.REMOVE_FEATURE_NOTIFICATION):
        case error(estateActions.SEND_FEATURE_NOTIFICATION):
            return Object.assign({}, state, {errors: action.payload.error.response.data.errors});

        default: {
            return state;
        }
    }
};