import * as estateActions from './actions';
import {success, error} from '~/axios/api';

export default (state = {
    mediaItems: null,
    message: null,
}, action) => {
    switch (action.type) {
        case success(estateActions.FETCH_NOTIFICATION_MEDIA):
        case success(estateActions.REMOVE_NOTIFICATION_MEDIA):
            return Object.assign({}, state, {...action.payload.data, errors: {}});

        case 'RESET_MESSAGE':
            return {
                ...state,
                message: null,
            };

        case error(estateActions.FETCH_NOTIFICATION_MEDIA):
        case error(estateActions.REMOVE_NOTIFICATION_MEDIA):
            return Object.assign({}, state, {errors: action.payload.error.response.data.errors});

        default: {
            return state;
        }
    }
};