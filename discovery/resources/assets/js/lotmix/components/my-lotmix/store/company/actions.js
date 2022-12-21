import {APIAction} from '~/axios/api';

export const GET_COMPANY_DATA = 'GET_COMPANY_DATA';
export const RESET_COMPANY_MESSAGES = 'RESET_COMPANY_MESSAGES';
export const RESET_COMPANY_STORE = 'RESET_COMPANY_STORE';

export const getCompanyData = (urlParams) => {
    const url = '/home/company/:companyId';
    return APIAction(GET_COMPANY_DATA, 'get', url, null, urlParams);
};

export const resetCompanyMessages = () => {
    return {type: RESET_COMPANY_MESSAGES};
};

export const resetCompanyStore = () => {
    return {type: RESET_COMPANY_STORE};
};

