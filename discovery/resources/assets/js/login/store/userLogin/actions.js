import {APIAction} from '~/axios/api';

export const GET_LOGIN_CONFIG = 'GET_LOGIN_CONFIG';
export const AUTHORIZE_USER = 'AUTHORIZE_USER';
export const SEND_AUTH_SMS = 'SEND_AUTH_SMS';

export const getLoginConfig = (params, query) => {
    const url = '/login/config';
    return APIAction(GET_LOGIN_CONFIG, 'get', url, null, params, query);
};

export const authorize = (url, data) => {
    return APIAction(AUTHORIZE_USER, 'post', url, data);
};

export const sendSMSAuthorizationCode = (data) => {
    const url = '/login/sendSMS';
    return APIAction(SEND_AUTH_SMS, 'post', url, data);
};