import {APIAction} from '~/axios/api';

export const FILTER_USERS_LIST = 'FILTER_USERS_LIST';
export const ADD_USER = 'ADD_USER';
export const REMOVE_USER = 'REMOVE_USER';
export const RESET_COMPANY_STORE = 'RESET_COMPANY_STORE';

/**
 *
 * @param urlParams Object
 * @param query Object
 * @returns {{type, payload}}
 */
export const getUsers = (urlParams, query) => {
    const url = '/landspot/pdf-manager/company/:id';
    return APIAction(FILTER_USERS_LIST, 'get', url, null, urlParams, query);
};

export const removeUser = (data, params) => {
    const url = '/landspot/pdf-manager/user/:id';
    return APIAction(REMOVE_USER, 'put', url, data, params);
};

export const resetCompanyStore = () => ({type: RESET_COMPANY_STORE});