import {APIAction} from '~/axios/api';

export const NEW_COMPANIES_CATALOGUE = 'NEW_COMPANIES_CATALOGUE';
export const FILTER_COMPANIES_CATALOGUE = 'FILTER_COMPANIES_CATALOGUE';
export const GET_USER = 'GET_USER';

export const newCompaniesCatalogue = () => {
    const url = '/landspot/pdf-manager/filter';
    return APIAction(NEW_COMPANIES_CATALOGUE, 'get', url);
};

export const filterCompaniesCatalogue = (query) => {
    const url = '/landspot/pdf-manager/filter?' + query;
    return APIAction(FILTER_COMPANIES_CATALOGUE, 'get', url);
};

export const getUser = () => {
    const url = '/landspot/pdf-manager/user';
    return APIAction(GET_USER, 'get', url);
};
