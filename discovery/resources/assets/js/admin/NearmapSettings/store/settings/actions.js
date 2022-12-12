import {APIAction} from '~/axios/api';

export const GET_SETTINGS = 'GET_SETTINGS';
export const UPDATE_SETTINGS = 'UPDATE_SETTINGS';
export const RESET_DATA_UPDATED = 'RESET_DATA_UPDATED';
export const RESET_STORE = 'RESET_STORE';

const url = '/landspot/nearmap-settings';

export const getSettings = () => APIAction(GET_SETTINGS, 'get', url);
export const updateSettings = data => APIAction(UPDATE_SETTINGS, 'post', url, data);
export const resetStore = () => ({type: RESET_STORE});
export const resetDataUpdated = () => ({type: RESET_DATA_UPDATED});
