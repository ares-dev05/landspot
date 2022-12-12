import {APIAction} from '~/axios/api';
import {FILTER_ESTATE_LIST} from '../catalogue/actions';

export const GET_ESTATE_LOTS = 'GET_ESTATE_LOTS';
export const RESET_ESTATE_DATA = 'RESET_ESTATE_DATA';
export const RESET_POPUP_MESSAGES = 'RESET_POPUP_MESSAGES';
export const SWITCH_LOT_TO_SHORTLIST = 'SWITCH_LOT_TO_SHORTLIST';

export const getEstateLots = (params, query) => {
    const url = '/land-for-sale/communities/:slug';
    return APIAction(GET_ESTATE_LOTS, 'get', url, null, params, query);
};

export const resetEstateData = () => {
  return APIAction(RESET_ESTATE_DATA);
};

export const switchLotToShortlist = params => {
    const url = '/home/toggle-lot-shortlist/:slug';
    return APIAction(SWITCH_LOT_TO_SHORTLIST, 'get', url, null, params);
};

export const filterEstatesList = (query) => {
    const url = '/land-for-sale/filter-estates?' + query;
    return APIAction(FILTER_ESTATE_LIST, 'get', url);
};