import * as userActions from './actions';
import {success, error} from "~sitings~/axios/api";

const initialState = Object.freeze({
    user: null,
});

export default (state = initialState, action) => {
    switch (action.type) {
        case success(userActions.GET_USER):
            return {...state, ...action.payload.data};

        case error(userActions.GET_USER):
            return {
                ...state,
                ...{errors: action.payload.error || action.payload.error.response.data.errors}
            };

        case userActions.RESET_USER_MESSAGES: {
            const newState = {...state};
            delete newState.message;
            delete newState.errors;
            return newState;
        }

        case userActions.RESET_PROFILE_STORE: {
            return {...initialState};
        }

        default:
            return state;
    }
};