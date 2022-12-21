import {APIAction} from '~/axios/api';

export const GET_ESTATES = 'GET_ESTATES';
export const RESET_COMPANY_STATE = 'RESET_COMPANY_STATE';
export const RESET_PRELOADER = 'RESET_PRELOADER';

import {apiUrl} from '../companies/actions'

export const getEstates = query => APIAction(GET_ESTATES, 'get', apiUrl, null, null, query);
export const resetCompanyData = () => ({type: RESET_COMPANY_STATE});
export const resetPreloader = () => ({type: RESET_PRELOADER});

