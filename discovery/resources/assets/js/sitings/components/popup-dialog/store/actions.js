import {APIAction} from '~sitings~/axios/api';

export const GET_FLOORPLAN_HISTORY = 'GET_FLOORPLAN_HISTORY';
export const GET_FLOORPLAN_DATA = 'GET_FLOORPLAN_DATA';
export const GET_FLOORPLAN_FILES = 'GET_FLOORPLAN_FILES';
export const STORE_FLOORPLAN_SVG = 'STORE_FLOORPLAN_SVG';
export const UPDATE_FLOORPLAN = 'UPDATE_FLOORPLAN';
export const RESET_FLOORPLAN_DATA_UPDATED = 'RESET_FLOORPLAN_DATA_UPDATED';
export const RESET_ERROR_MESSAGES = 'RESET_ERROR_MESSAGES';
export const RESET_DIALOG_STORE = 'RESET_DIALOG_STORE';
export const RESET_MESSAGES = 'RESET_MESSAGES';
export const RESET_FLOORPLAN_SVG_DATA_UPDATED = 'RESET_FLOORPLAN_SVG_DATA_UPDATED';
export const GET_CLIENTS_LIST = 'GET_CLIENTS_LIST';

export const STORE_FLOORPLAN_FORM = 'STORE_FLOORPLAN_FORM';

const url = '/sitings/plans/floorplans/history/:id';
const filesUrl = '/sitings/plans/floorplans/files/:id';

export const getFloorplanHistory = params => {
    return APIAction(GET_FLOORPLAN_HISTORY, 'get', url, null, params);
};

export {updateFloorplanHistory} from '../../builder/store/new-floorplan-form/actions';

export const getFloorplanFiles = params => {
    return APIAction(GET_FLOORPLAN_FILES, 'get', filesUrl, null, params);
};

export const getFloorplanData = (urlParams) => {
    return APIAction(GET_FLOORPLAN_DATA, 'get', '/sitings/plans/floorplans/:id', null, urlParams);
};

export const updateFloorplan = (urlParams, data, query) => {
    return APIAction(UPDATE_FLOORPLAN, 'put', '/sitings/plans/floorplans/:id', data, urlParams, query);
};

export const storeFloorplanForm = (data) => {
    return APIAction(STORE_FLOORPLAN_FORM, 'post', url, data);
};

export const storeFloorplanSVG = (data) => {
    return APIAction(STORE_FLOORPLAN_SVG, 'post', '/sitings/plans/svg/viewer', data);
};

export const getClientsList = urlParams => {
    const url = '/sitings/drawer/get-clients/:id';
    return APIAction(GET_CLIENTS_LIST, 'get', url, null, urlParams);
};

export const resetFloorplanDataUpdated = () => ({type: RESET_FLOORPLAN_DATA_UPDATED});

export const resetFloorplanSvgDataUpdated = () => ({type: RESET_FLOORPLAN_SVG_DATA_UPDATED});

export const resetErrorMessages = () => {
    return {type: RESET_ERROR_MESSAGES};
};

export const resetMessages = () => {
    return {type: RESET_MESSAGES};
};

export const resetDialogStore = () => {
    return {type: RESET_DIALOG_STORE};
};
