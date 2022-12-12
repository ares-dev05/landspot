import {APIAction} from '~/axios/api';

export const GET_ESTATE_INFO = 'GET_ESTATE_INFO';
export const getEstateInfo = params => {
    const url = '/home/estate/:id';
    return APIAction(GET_ESTATE_INFO, 'post', url, null, params);
};

export const TOGGLE_LOT_TO_SHORTLIST = 'TOGGLE_LOT_TO_SHORTLIST';
export const toggleLotToShortlist = params => {
    const url = '/home/toggle-lot-shortlist/:id';
    return APIAction(TOGGLE_LOT_TO_SHORTLIST, 'get', url, null, params);
};
