import {APIAction} from '~/axios/api';

export const GET_USER_NOTIFICATIONS = 'GET_USER_NOTIFICATIONS';
export const SET_USER_DECISION = 'SET_USER_DECISION';
export const CLOSE_NOTIFICATION = 'CLOSE_NOTIFICATION';
export const ACCEPT_TOS = 'ACCEPT_TOS';
export const RESET_MESSAGES = 'RESET_MESSAGES';

export const getUser = () => {
    return APIAction(GET_USER_NOTIFICATIONS, 'get', '/landspot/notification/');
};

export const setUserDecision = (data, params) => {
    const url = '/landspot/support-notification/:id';
    return APIAction(SET_USER_DECISION, 'put', url, data, params);
};

export const closeNotification = (params) => {
    const url = '/landspot/notification/:id';
    return APIAction(CLOSE_NOTIFICATION, 'post', url, null, params);
};

export const acceptTOS = () => {
    const url = '/profile/tos';
    return APIAction(ACCEPT_TOS, 'put', url);
};

export const resetMessages = () => {
    return APIAction(RESET_MESSAGES);
};
