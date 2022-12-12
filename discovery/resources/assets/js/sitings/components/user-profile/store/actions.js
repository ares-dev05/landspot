import {APIAction} from '~sitings~/axios/api';

export const GET_USER = 'GET_USER';
export const RESET_USER_MESSAGES = 'RESET_USER_MESSAGES';
export const RESET_PROFILE_STORE = 'RESET_PROFILE_STORE';

export const getUser = () => {
    const url = '/sitings/profile';
    return APIAction(GET_USER, 'get', url);
};

export const resetMessages = () => {
    return {type: RESET_USER_MESSAGES};
};

export const resetProfileStore = () => {
    return {type: RESET_PROFILE_STORE};
};

