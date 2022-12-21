import {success} from '~/axios/api';
import * as actions from './actions';

const initialState = {
    message: null,
    estateChannels: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case success(actions.GET_BROWSER_NOTIFICATION_CHANNELS):
            return Object.assign({}, state, action.payload.data);

        case 'RESET_BROWSER_NOTIFICATION':
            return initialState;

        case 'RESET_CHANNELS_UPDATED': {
            const newState = {...state};
            delete newState['CHANNELS_UPDATED'];
            return newState;
        }

        default:
            return state;
    }
};