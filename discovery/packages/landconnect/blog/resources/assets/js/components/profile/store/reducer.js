import * as userActions from './actions';
import {success, error} from "~blog~/axios/api";

const initialState = {
    user: {},
};

export default (state = initialState, action) => {
    switch (action.type) {
        case success(userActions.GET_USER):
        case success(userActions.SUBSCRIBE_TO_THE_NEWSLETTER):
            return Object.assign({}, state, action.payload.data);

        case error(userActions.GET_USER):
        case error(userActions.SUBSCRIBE_TO_THE_NEWSLETTER):
            return Object.assign({}, state, {
                errors: action.payload.error.response.data.errors ||
                    action.payload.error.response.data.message
            });

        case userActions.RESET_USER_MESSAGES: {
            const newState = {...state};
            delete newState.message;
            delete newState.errors;
            return newState;
        }

        default:
            return state;
    }
};