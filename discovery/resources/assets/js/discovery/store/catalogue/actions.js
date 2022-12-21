import {APIAction} from '~/axios/api';

export const FILTER_CATALOGUE = 'FILTER_CATALOGUE';
export const RESET_CATALOGUE_STORE = 'RESET_CATALOGUE_STORE';


export const filterCatalogue = (url) => {
    return APIAction(FILTER_CATALOGUE, 'get', url);
};

export const resetCatalogue = (data) => {
    return {type: RESET_CATALOGUE_STORE};
};