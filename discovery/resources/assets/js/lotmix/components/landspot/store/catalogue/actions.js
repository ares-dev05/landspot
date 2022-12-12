import {APIAction} from '~/axios/api';

export const FILTER_ESTATE_LIST = 'FILTER_ESTATE_LIST';

export const filterEstatesList = (query) => {
    const url = '/land-for-sale/filter-estates?' + query;
    return APIAction(FILTER_ESTATE_LIST, 'get', url);
};
