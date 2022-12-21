import {APIAction} from '~/axios/api';

export const FILTER_USERS_LIST = 'FILTER_USERS_LIST';
export const ADD_USER = 'ADD_USER';
export const UPDATE_USER = 'UPDATE_USER';
export const REMOVE_USER = 'REMOVE_USER';
export const RESTORE_USER = 'RESTORE_USER';
export const SEND_RESET_PASSWORD_LINK = 'SEND_RESET_PASSWORD_LINK';
export const RESET_USER_2FA = 'RESET_USER_2FA';
export const SEND_SUPPORT_REQUEST = 'SEND_SUPPORT_REQUEST';
export const CLOSE_ACCESS_REQUEST = 'CLOSE_ACCESS_REQUEST';

export const getUsers = (params, query) => {
  const url = '/landspot/user-manager/company/:id';
  return APIAction(FILTER_USERS_LIST, 'get', url, null, params, query);
};

export const addUser = (data) => {
  const url = '/landspot/user-manager/user';
  return APIAction(ADD_USER, 'post', url, data);
};

export const updateUser = (data, params) => {
  const url = '/landspot/user-manager/user/:id';
  return APIAction(UPDATE_USER, 'put', url, data, params);
};

export const removeUser = (data, params) => {
  const url = '/landspot/user-manager/user/:id';
  return APIAction(REMOVE_USER, 'delete', url, data, params);
};

export const restoreUser = (data, params) => {
  const url = '/landspot/user-manager/user/restore/:id';
  return APIAction(RESTORE_USER, 'put', url, data, params);
};

export const sendResetPasswordLink = (data, params) => {
    const url = '/landspot/user-manager/reset-password/:id';
    return APIAction(SEND_RESET_PASSWORD_LINK, 'post', url, data, params);
};

export const resetUser2FA = (data, params) => {
    const url = '/landspot/user-manager/reset-user-2fa/:id';
    return APIAction(RESET_USER_2FA, 'post', url, data, params);
};

export const sendSupportRequest = (data, params) => {
    const url = '/landspot/user-manager/support-request/:id';
    return APIAction(SEND_SUPPORT_REQUEST, 'post', url, data, params);
};

export const closeAccessRequest = (data, params) => {
    const url = '/landspot/user-manager/close-access-request/:id';
    return APIAction(CLOSE_ACCESS_REQUEST, 'post', url, data, params);
};

export {updateCompany} from '../catalogue/actions';