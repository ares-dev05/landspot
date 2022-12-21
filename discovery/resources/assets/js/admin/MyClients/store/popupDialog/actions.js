import {APIAction} from '~/axios/api';

export const GET_SHORT_LISTS = 'GET_SHORT_LISTS';
export const getShortLists = urlParams => {
    const url = '/landspot/short-list/:id';
    return APIAction(GET_SHORT_LISTS, 'get', url, null, urlParams);
};
export const GET_INVITED_USER_DETAILS = 'GET_INVITED_USER_DETAILS';
export const getInvitedUserDetails = urlParams => {
    const url = '/landspot/my-client-details/:id';
    return APIAction(GET_INVITED_USER_DETAILS, 'get', url, null, urlParams);
};

export const UPDATE_USER_DETAILS = 'UPDATE_USER_DETAILS';
export const updateUserDetails = data => {
    const url = '/landspot/my-client-details';
    return APIAction(UPDATE_USER_DETAILS, 'POST', url, data);
};

export const UPDATE_SHORT_LIST = 'UPDATE_SHORT_LIST';
export const updateShortLists = data => {
    const url = '/landspot/short-list';
    return APIAction(UPDATE_SHORT_LIST, 'post', url, data);
};

export const UPLOAD_DOCUMENT = 'UPLOAD_DOCUMENT';
export const uploadDocument = data => {
    const url = '/landspot/my-client-files';
    return APIAction(UPLOAD_DOCUMENT, 'put', url, data);
};

export const VIEW_DOCUMENT = 'VIEW_DOCUMENT';
export const viewDocument = id => {
    return {type: VIEW_DOCUMENT, payload: {documentId: id}};
};

export const RESET_DIALOG_STORE = 'RESET_DIALOG_STORE';
export const resetDialogStore = () => {
    return {type: RESET_DIALOG_STORE};
};

export const CLONE_EXISTING_POPUP_SITING = 'CLONE_EXISTING_POPUP_SITING';
export const cloneExistingSiting = (urlParams, data) => {
    const url = '/landspot/my-clients/clone-siting/:id';
    return APIAction(CLONE_EXISTING_POPUP_SITING, 'post', url, data, urlParams);
};

export const DELETE_POPUP_SITING = 'DELETE_POPUP_SITING';
export const deleteMySiting = urlParams => {
    const url = '/landspot/my-sitings/:id';
    return APIAction(DELETE_POPUP_SITING, 'delete', url, null, urlParams);
};

export const UPDATE_MY_CLIENT = 'UPDATE_MY_CLIENT';
export const updateMyClient = (data, urlParams) => {
    const url = '/landspot/my-clients/:id';
    return APIAction(UPLOAD_DOCUMENT, 'put', url, data, urlParams);
};

export const GET_AVAILABLE_MANAGERS = 'GET_AVAILABLE_MANAGERS';
export const getAvailableManagers = urlParams => {
    const url = '/landspot/my-clients/managers/:id';
    return APIAction(GET_AVAILABLE_MANAGERS, 'get', url, null, urlParams);
};

export const GET_DRAFT_SITING_MANAGERS = 'GET_DRAFT_SITING_MANAGERS';
export const getDraftSitingManagers = urlParams => {
    const url = '/landspot/my-clients/draft-siting-managers/:id';
    return APIAction(GET_DRAFT_SITING_MANAGERS, 'get', url, null, urlParams);
};

export const SHARE_BUYER_CREDENTIALS = 'SHARE_BUYER_CREDENTIALS';
export const shareBuyerCredentials = (data, urlParams) => {
    const url = '/landspot/my-clients/share-credentials/:id';
    return APIAction(SHARE_BUYER_CREDENTIALS, 'post', url, data, urlParams);
};


export const DELETE_INVITED_USER_SITING = 'DELETE_INVITED_USER_SITING';
export const deleteInvitedUserSiting = (data, urlParams) => {
    const url = '/landspot/my-client-sitings/:id';
    return APIAction(
        DELETE_INVITED_USER_SITING,
        'delete',
        url,
        data,
        urlParams
    );
};

export const GET_MY_SITINGS = 'GET_MY_SITINGS';
export const getDraftSitings = () => {
    const url = '/landspot/my-sitings';
    return APIAction(GET_MY_SITINGS, 'get', url);
};

export const GET_LEGACY_SITINGS = 'GET_LEGACY_SITINGS';
export const getLegacySitings = () => {
    const url = '/landspot/legacy-sitings';
    return APIAction(GET_LEGACY_SITINGS, 'get', url);
};

export const SHARE_DRAFT_SITING = 'SHARE_DRAFT_SITING';
export const shareDraftSiting = (data, urlParams) => {
    const url = '/landspot/my-clients/share-draft-siting/:id';
    return APIAction(SHARE_DRAFT_SITING, 'post', url, data, urlParams);
};

export const IMPORT_SITING = 'IMPORT_SITING';
export const importSiting = (urlParams) => {
    const url = '/landspot/my-clients/import/:importId';
    return APIAction(IMPORT_SITING, 'get', url, null, urlParams);
};
