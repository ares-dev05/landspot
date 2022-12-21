import {APIAction} from '~sitings~/axios/api';
import {GET_FLOORPLAN_DATA, STORE_FLOORPLAN_FORM} from '../../../popup-dialog/store/actions';
import {UPDATE_FLOORPLAN_HISTORY} from '../floorplans/actions';

export const RESET_FORM_STORE = 'RESET_FORM_STORE';
export const EDIT_FLOORPLAN_FORM = 'EDIT_FLOORPLAN_FORM';
export const RESET_FLOORPLAN_DATA_UPDATED = 'RESET_FLOORPLAN_DATA_UPDATED';
export const RESET_MESSAGES = 'RESET_MESSAGES';

export const getFloorplanData = (urlParams) => {
    return APIAction(GET_FLOORPLAN_DATA, 'get', '/sitings/plans/floorplans/:id', null, urlParams);
};

export const updateFloorplanHistory = (params, data) => {
    return APIAction(UPDATE_FLOORPLAN_HISTORY, 'put', '/sitings/plans/floorplans/history/:id', data, params);
};

export const storeFloorplanForm = (data) => {
    return APIAction(STORE_FLOORPLAN_FORM, 'post', '/sitings/plans/floorplans', data);
};

export const resetFloorplanFormStore = () => {
    return {type: RESET_FORM_STORE};
};

export const resetMessages = () => {
    return {type: RESET_MESSAGES};
};

export const resetFloorplanDataUpdated = () => ({type: RESET_FLOORPLAN_DATA_UPDATED});