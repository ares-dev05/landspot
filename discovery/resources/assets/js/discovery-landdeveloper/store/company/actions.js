import {APIAction} from '~/axios/api';

export const RESET_COMPANY_DATA = 'RESET_COMPANY_DATA';

export const resetCompanyData = () => {
    return {type: RESET_COMPANY_DATA};
};
