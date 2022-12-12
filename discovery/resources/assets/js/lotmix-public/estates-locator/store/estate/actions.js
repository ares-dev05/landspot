import {APIAction} from '~/axios/api';

export const GET_STATE_ESTATES = 'GET_STATE_ESTATES';
export const getStateEstates = urlParams => {
    const url = '/public-estates/:state';
    return APIAction(GET_STATE_ESTATES, 'get', url, null, urlParams);
};