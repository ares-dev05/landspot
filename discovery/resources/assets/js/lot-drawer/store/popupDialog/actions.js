import {APIAction} from '~/axios/api';

export const GET_LOT_DRAWER_DATA = 'GET_LOT_DRAWER_DATA';
export const RESET_DIALOG_STORE = 'RESET_DIALOG_STORE';

export const getLotDrawerData = (urlParams) => {
    return APIAction(GET_LOT_DRAWER_DATA, 'get', '/landspot/api/lot-drawer/load-dialog-data/:lotId', null, urlParams);
};

export const resetDialogStore = () => {
    return {type: RESET_DIALOG_STORE};
};