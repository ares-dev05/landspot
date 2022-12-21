import {APIAction} from '~/axios/api';

export const GET_ESTATE = 'GET_ESTATE';
export const getEstate = url => {
    return APIAction(GET_ESTATE, 'get', url);
};