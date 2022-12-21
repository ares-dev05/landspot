import {APIAction} from '~/axios/api';

export const RESET_COMPANY_DATA = 'RESET_COMPANY_DATA';
export const SWITCH_HOUSE_TO_SHORTLIST = 'SWITCH_HOUSE_TO_SHORTLIST';

export const resetCompanyData = () => {
    return {type: RESET_COMPANY_DATA};
};


export const switchHouseToShortlist = id => {
    const url = '/home/toggle-house-shortlist/:id';
    return APIAction(SWITCH_HOUSE_TO_SHORTLIST, 'post', url, null, {id});
};
