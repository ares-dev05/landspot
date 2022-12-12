import {APIAction} from '~sitings~/axios/api';

export const GET_SVG = 'GET_SVG';
export const RESET_SVG_STORE = 'RESET_SVG_STORE';
export const RESET_SVG_UPDATED = 'RESET_SVG_UPDATED';
export const RESET_SVG_MESSAGES = 'RESET_SVG_MESSAGES';

const url = '/sitings/plans/svg/viewer';

export const getSVG = (urlParams) => {
    return APIAction(GET_SVG, 'get', `${url}/:id`, null, urlParams);
};

export const resetStore = () => ({type: RESET_SVG_STORE});
export const resetSVGUpdated = () => ({type: RESET_SVG_UPDATED});
export const resetSVGMessages = () => ({type: RESET_SVG_MESSAGES});