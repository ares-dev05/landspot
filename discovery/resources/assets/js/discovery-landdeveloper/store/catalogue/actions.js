import {APIAction} from '~/axios/api';

export const FILTER_COMPANIES_CATALOGUE = 'FILTER_COMPANIES_CATALOGUE';
export const FILTER_COMPANY_HOUSES = 'FILTER_COMPANY_HOUSES';

export const filterCompaniesCatalogue = (query) => {
    const url = '/landspot/discovery/filter';
    return APIAction(FILTER_COMPANIES_CATALOGUE, 'get', url, null, null, query);
};

export const filterCompanyHouses = (urlParams, query) => {
    return APIAction(FILTER_COMPANY_HOUSES, 'get', '/landspot/discovery/company/:companyID/filter', null, urlParams, query);
};