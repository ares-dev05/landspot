import {APIAction} from '~/axios/api';


export const GET_HOUSE_DETAILS = 'GET_HOUSE_DETAILS';
export const GET_HOUSE_MEDIA = 'GET_HOUSE_MEDIA';
export const UPDATE_HOUSE_MEDIA = 'UPDATE_HOUSE_MEDIA';
export const REMOVE_HOUSE_MEDIA = 'REMOVE_HOUSE_MEDIA';
export const SAVE_HOUSE = 'SAVE_HOUSE';
export const SAVE_HOUSE_DETAILS = 'SAVE_HOUSE_DETAILS';
export const SAVE_RANGE_INCLUSIONS = 'SAVE_RANGE_INCLUSIONS';
export const RESET_DIALOG_STORE = 'RESET_DIALOG_STORE';
export const SET_COMPANY_PROFILE_DATA = 'SET_COMPANY_PROFILE_DATA';

export const resetDialogStore = () => {
    return {type: RESET_DIALOG_STORE};
};

export const uploadMediaUrl = '/manager/update-house-media/:id';

export const getHouseDetails = (urlParams) => {
    const url = '/manager/get-details/:id';
    return APIAction(GET_HOUSE_DETAILS, 'get', url, null, urlParams);
};

export const saveHouseDetails = (data, urlParams) => {
    const url = '/manager/edit-details/:id';
    return APIAction(SAVE_HOUSE_DETAILS, 'post', url, data, urlParams);
};

export const getHouseMedia = (data, urlParams) => {
    const url = '/manager/get-house-media/:id';
    return APIAction(GET_HOUSE_MEDIA, 'post', url, data, urlParams);
};

export const saveRangeInclusions = (data) => {
    const url = '/manager/save-range-inclusions';
    return APIAction(SAVE_RANGE_INCLUSIONS, 'post', url, data);
};

export const updateHouseMedia = (data, urlParams) => {
    return APIAction(UPDATE_HOUSE_MEDIA, 'post', uploadMediaUrl, data, urlParams);
};

export const removeHouseMedia = (urlParams) => {
    const url = 'manager/delete/:mediaType/:id';
    return APIAction(REMOVE_HOUSE_MEDIA, 'delete', url, null, urlParams);
};

export const saveHouse = (data) => {
    const url = '/manager/add-house';
    return APIAction(SAVE_HOUSE, 'post', url, data);
};

export const setCompanyProfileData = (data) => {
    const url = '/manager/set-company-data';
    return APIAction(SET_COMPANY_PROFILE_DATA, 'post', url, data);
};