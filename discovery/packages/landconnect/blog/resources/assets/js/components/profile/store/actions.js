import {APIAction} from "~blog~/axios/api";

export const GET_USER = 'GET_USER';
export const SUBSCRIBE_TO_THE_NEWSLETTER = 'SUBSCRIBE_TO_THE_NEWSLETTER';
export const RESET_USER_MESSAGES = 'RESET_USER_MESSAGES';

export const getUser = () => {
    const url = '/insights/api/get-user';
    return APIAction(GET_USER, 'get', url);
};

export const subscribe = (data) => {
    const url = '/insights/api/subscribe';
    return APIAction(SUBSCRIBE_TO_THE_NEWSLETTER, 'post', url, data);
};

export const resetMessages = () => {
    return {type: RESET_USER_MESSAGES};
};

