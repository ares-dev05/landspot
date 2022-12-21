import {APIAction} from '~sitings~/axios/api';

export const GET_FLOORPLANS = 'GET_FLOORPLANS';
export const UPDATE_FLOORPLAN = 'UPDATE_FLOORPLAN';
export const UPDATE_FLOORPLAN_HISTORY = 'UPDATE_FLOORPLAN_HISTORY';
export const DELETE_FLOORPLAN = 'DELETE_FLOORPLAN';
export const RESET_FLOORPLANS_STORE = 'RESET_FLOORPLANS_STORE';
export const RESET_DATA_UPDATED = 'RESET_DATA_UPDATED';
export const RESET_MESSAGES = 'RESET_MESSAGES';

const url = '/sitings/plans/floorplans';

export const getFloorplans = (query) => {
    return APIAction(GET_FLOORPLANS, 'get', url, null, null, query);
};

export const updateFloorplan = (urlParams, data, query) => {
    return APIAction(UPDATE_FLOORPLAN, 'put', `${url}/:id`, data, urlParams, query);
};

export const deleteFloorplan = (urlParams, query) => {
    return APIAction(DELETE_FLOORPLAN, 'delete', `${url}/:id`, null, urlParams, query);
};

export const resetFloorplansMessages = () =>({type:RESET_MESSAGES});
export const resetFloorplansStore = () => ({type: RESET_FLOORPLANS_STORE});
export const resetDataUpdated = () => ({type: RESET_DATA_UPDATED});