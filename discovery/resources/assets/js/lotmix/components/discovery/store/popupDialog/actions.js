import {APIAction} from '~/axios/api';
const URL_PREFIX = '/enquire';

export const SEND_COMPANY_ENQUIRE_FORM = 'SEND_COMPANY_ENQUIRE_FORM';
export const sendCompanyEnquireForm = (data, urlParams) => {
    const url = URL_PREFIX + '/message/companies/:id';
    return APIAction(SEND_COMPANY_ENQUIRE_FORM, 'post', url, data, urlParams);
};

export const SEND_ESTATE_ENQUIRE_FORM = 'SEND_ESTATE_ENQUIRE_FORM';
export const sendEstateEnquireForm = (data, urlParams) => {
    const url = URL_PREFIX + '/message/estates/:id';
    return APIAction(SEND_ESTATE_ENQUIRE_FORM, 'post', url, data, urlParams);
};

export const SEND_SMS_VERIFICATION = 'SEND_SMS_VERIFICATION';
export const sendSMSVerification = (data, urlParams) => {
    const url = URL_PREFIX + '/sms-verification';
    return APIAction(SEND_SMS_VERIFICATION, 'post', url, data, urlParams);
};

export const VERIFY_SMS_CODE = 'VERIFY_SMS_CODE';
export const verifySMSCode = (data, urlParams) => {
    const url = URL_PREFIX + '/verify-sms-code';
    return APIAction(VERIFY_SMS_CODE, 'post', url, data, urlParams);
};

export const RESET_DIALOG_STORE = 'RESET_DIALOG_STORE';
export const resetDialogStore = () => {
    return {type: RESET_DIALOG_STORE};
};

export const RESET_POPUP_MESSAGES = 'RESET_POPUP_MESSAGES';
export const resetPopupMessages = () => {
    return {type: RESET_POPUP_MESSAGES};
};

export const SET_ENQUIRE_STATE = 'SET_ENQUIRE_STATE';
export const setEnquireState = (data) => {
    return {type: SET_ENQUIRE_STATE, payload:{data}};
};

export const SHOW_ENQUIRE_DIALOG = 'SHOW_ENQUIRE_DIALOG';
export const showEnquireDialog = (data) => {
    return {type: SHOW_ENQUIRE_DIALOG, payload:{data}};
};



