import {APIAction} from '~/axios/api';

export const GET_HOUSES = 'GET_HOUSES';
export const UPDATE_HOUSE_DISCOVERY = 'UPDATE_HOUSE_DISCOVERY';
export const REMOVE_HOUSE = 'REMOVE_HOUSE';
export const REMOVE_RANGE = 'REMOVE_RANGE';
export const RESET_MANAGER_DATA = 'RESET_MANAGER_DATA';
export const RESET_POPUP_MESSAGES = 'RESET_POPUP_MESSAGES';

export const getHouses = (query) => {
    const url = '/manager/get-houses';
    return APIAction(GET_HOUSES, 'get', url, null, null, query);
};

export const updateHouseDiscovery = (data, urlParams) => {
    const url = '/manager/discovery-house/:id';
    return APIAction(UPDATE_HOUSE_DISCOVERY, 'post', url, data, urlParams);
};

export const removeHouse = (data, urlParams) => {
    const url = '/manager/delete-house/:id';
    return APIAction(REMOVE_HOUSE, 'delete', url, data, urlParams);
};

export const removeRange = (data, urlParams) => {
    const url = '/manager/delete-range/:id';
    return APIAction(REMOVE_RANGE, 'delete', url, data, urlParams);
};

export const resetManagerData = () => {
    return APIAction(RESET_MANAGER_DATA);
};
