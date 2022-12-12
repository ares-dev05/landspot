import {APIAction} from '~/axios/api';

export const GET_COMPANIES = 'GET_COMPANIES';
export const RESET_COMPANIES_STATE = 'RESET_COMPANIES_STATE';

export const apiUrl = '/landspot/admin/developers-features';

export const getDeveloperCompanies = () => APIAction(GET_COMPANIES, 'get', apiUrl);
export const resetCompaniesState = () => ({type: RESET_COMPANIES_STATE});
