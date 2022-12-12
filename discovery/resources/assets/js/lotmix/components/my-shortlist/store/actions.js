import {APIAction} from '~/axios/api';

export const GET_SHORTLIST_DATA = 'GET_SHORTLIST_DATA';

export const getShortlistData = data => {
    const url = '/my-shortlist';
    return APIAction(GET_SHORTLIST_DATA, 'post', url, data);
};
