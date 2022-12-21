import {APIAction} from '~sitings~/axios/api';

export const LOAD_REF_DOC          = 'LOAD_REF_DOC';
export const SAVE_RAW_DATA         = 'SAVE_RAW_DATA';
export const CREATE_NEW_SITING     = 'CREATE_NEW_SITING';
export const SITE_LOT_AGAIN        = 'SITE_LOT_AGAIN';

export const LOAD_SITING_DRAWER    = 'LOAD_SITING_DRAWER';
export const RESET_DRAWER_MESSAGES = 'RESET_DRAWER_MESSAGES';
export const RESET_DRAWER_UPDATED  = 'RESET_DRAWER_UPDATED';
export const RESET_DRAWER_STATE    = 'RESET_DRAWER_STATE';
export const RESET_EXPORT_COMPLETE = 'RESET_EXPORT_COMPLETE';
export const RESET_STEP_FROM_STORE = 'RESET_STEP_FROM_STORE';

export const resetDrawerStore    = () => ({type: RESET_DRAWER_STATE});
export const resetDrawerUpdated  = () => ({type: RESET_DRAWER_UPDATED});
export const resetStepFromStore  = () => ({type: RESET_STEP_FROM_STORE});
export const resetMesages        = () => ({type: RESET_DRAWER_MESSAGES});
export const resetExportComplete = () => ({type: RESET_EXPORT_COMPLETE});

export const loadSitingWithRef = (urlParams) => {
    const url = '/sitings/drawer/siting/plan/:sitingId';
    return APIAction(LOAD_REF_DOC, 'get', url, null, urlParams);
};

export const createNewSiting = () => {
    const url = '/sitings/drawer/siting/create';
    return APIAction(CREATE_NEW_SITING, 'get', url);
};

export const loadSitingDrawer = (urlParams, params) => {
    const url = '/sitings/drawer/siting/:sitingId';
    return APIAction(LOAD_SITING_DRAWER, 'get', url, null, urlParams, params);
};

export const saveRawData = (data, urlParams) => {
    const url = '/sitings/drawer/siting/:sitingId';
    return APIAction(SAVE_RAW_DATA, 'put', url, data, urlParams);
};

export const resiteLot = (data, urlParams) => {
    const url = '/sitings/drawer/resite/:sitingId';
    return APIAction(SITE_LOT_AGAIN, 'put', url, data, urlParams);
};