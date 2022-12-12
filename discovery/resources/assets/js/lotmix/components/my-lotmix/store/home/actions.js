import {APIAction} from '~/axios/api';

export const GET_USER_LOTMIX = 'GET_USER_LOTMIX';
export const RESET_LOTMIX_MESSAGES = 'RESET_LOTMIX_MESSAGES';
export const RESET_LOTMIX_STORE = 'RESET_LOTMIX_STORE';

export const getLotmix = () => {
    const url = '/home';
    return APIAction(GET_USER_LOTMIX, 'get', url);
};

export const resetMessages = () => {
    return {type: RESET_LOTMIX_MESSAGES};
};

export const resetLotmixStore = () => {
    return {type: RESET_LOTMIX_STORE};
};

