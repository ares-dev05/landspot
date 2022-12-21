import {APIAction} from '~/axios/api';

export const GET_ESTATE_DATA = 'GET_ESTATE_DATA';
export const LOAD_POS = 'LOAD_POS';
export const LOAD_LOT_RAW_DATA = 'LOAD_LOT_RAW_DATA';
export const LOAD_LOT_SETTINGS = 'LOAD_LOT_SETTINGS';
export const SAVE_LOT_RAW_DATA = 'SAVE_LOT_RAW_DATA';
export const RESET_DRAWER_MESSAGES = 'RESET_DRAWER_MESSAGES';

export const getEstateData = (urlParams) => {
    const url = '/landspot/api/lot-drawer/:estateId';
    return APIAction(GET_ESTATE_DATA, 'get', url, null, urlParams);
};

export const loadPOSDoc = (urlParams) => {
    const url = '/landspot/api/lot-drawer/load-pos/:id';
    return APIAction(LOAD_POS, 'get', url, null, urlParams);
};

export const loadLotData = (urlParams) => {
    const url = '/landspot/api/lot-drawer/load-lot-data/:id';
    return APIAction(LOAD_LOT_RAW_DATA, 'get', url, null, urlParams);
};

export const loadLotSettings = (urlParams) => {
    const url = '/landspot/api/lot-drawer/load-lot-settings/:id';
    return APIAction(LOAD_LOT_SETTINGS, 'get', url, null, urlParams);
};

export const saveLotRawData = (data, urlParams) => {
    const url = '/landspot/api/lot-drawer/save-lot-data/:id';
    return APIAction(SAVE_LOT_RAW_DATA, 'post', url, data, urlParams);
};