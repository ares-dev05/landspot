import {APIAction} from '~/axios/api';

export const GET_USER_PROFILE = 'GET_USER_PROFILE';
export const UPDATE_USER_PROFILE = 'UPDATE_USER_PROFILE';
export const CHANGE_USER_PHONE = 'CHANGE_USER_PHONE';
export const AUTHORIZE_FOR_2FA = 'AUTHORIZE_FOR_2FA';
export const GET_2FA_CONFIG = 'GET_2FA_CONFIG';
export const VERIFY_OTP_CODE = 'VERIFY_OTP_CODE';

export const getUserProfile = (params, query) => {
  const url = '/profile';
  return APIAction(GET_USER_PROFILE, 'get', url, null, params, query);
};

export const changeUserPhone = (data) => {
  const url = '/profile/phone';
    return APIAction(CHANGE_USER_PHONE, 'put', url, data);
};

export const updateUserProfile = (data) => {
  const url = '/profile/update';
  return APIAction(UPDATE_USER_PROFILE, 'put', url, data);
};

export const authorizeFor2FAConfiguration = (data) => {
    const url = '/profile/authorizeAccess';
    return APIAction(AUTHORIZE_FOR_2FA, 'post', url, data);
};

export const get2FAConfig = (query) => {
    const url = '/profile/2FA';
    return APIAction(GET_2FA_CONFIG, 'get', url, null, null, query);
};
export const verifyOTPcode = (data) => {
    const url = '/profile/2FA';
    return APIAction(VERIFY_OTP_CODE, 'post', url, data);
};