import {APIAction} from '~/axios/api';

export const LOAD_ESTATES_WITH_USER_PERMISSIONS = 'LOAD_ESTATES_WITH_USER_PERMISSIONS';
export const RESET_DIALOG_STORE = 'RESET_DIALOG_STORE';
export const SAVE_PERMISSIONS = 'SAVE_PERMISSIONS';
export const GET_COMPANY_DATA = 'GET_COMPANY_DATA';
export const SAVE_SALES_LOCATIONS = 'SAVE_SALES_LOCATIONS';
export const SAVE_LOTMIX_SETTINGS = 'SAVE_LOTMIX_SETTINGS';

export const getEstatesWithUserPermissions = (data, params) => APIAction(
    LOAD_ESTATES_WITH_USER_PERMISSIONS, 'get', '/landspot/user-manager/estates/:id', data, params
);

export const savePermissions = (data, params) => APIAction(
    SAVE_PERMISSIONS, 'post', '/landspot/user-manager/estates/:id', data, params
);

export const saveLocations = (data, params) => APIAction(
    SAVE_SALES_LOCATIONS, 'post', '/landspot/user-manager/sales-locations/:id', data, params
);

export const saveLotmixSettings = (data, params) => APIAction(
    SAVE_LOTMIX_SETTINGS, 'post', '/landspot/user-manager/lotmix-settings/:id', data, params
);

export const getCompanyData = (params) => APIAction(
    GET_COMPANY_DATA, 'get', '/landspot/company/:id', null, params
);

export const resetDialogStore = () => {
    return {type: RESET_DIALOG_STORE};
};
