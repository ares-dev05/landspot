import {APIAction} from '~/axios/api';
export {updateEstate} from '../estate/actions';

export const UPDATE_LOT_VISIBILITY = 'UPDATE_LOT_VISIBILITY';
export const LOAD_LOT_VISIBILITY = 'LOAD_LOT_VISIBILITY';
export const LOAD_LOT_PACKAGES = 'LOAD_LOT_PACKAGES';
export const DELETE_LOT_PACKAGE = 'DELETE_LOT_PACKAGE';
export const LOAD_LOT_PACKAGES_FOR_UPLOAD = 'LOAD_LOT_PACKAGES_FOR_UPLOAD';
export const RESET_DIALOG_STORE = 'RESET_DIALOG_STORE';
export const UPDATE_LOT_PACKAGES = 'UPDATE_LOT_PACKAGES';
export const LOAD_ESTATE_DOCUMENTS = 'LOAD_ESTATE_DOCUMENTS';
export const UPDATE_ESTATE_DOCUMENTS = 'UPDATE_ESTATE_DOCUMENTS';
export const LOAD_PDF_TEMPLATE = 'LOAD_PDF_TEMPLATE';
export const UPDATE_PDF_TEMPLATE = 'UPDATE_PDF_TEMPLATE';
export const ADD_ESTATE = 'ADD_ESTATE';
export const DELETE_ESTATE_PACKAGE = 'DELETE_ESTATE_PACKAGE';
export const RESET_DIALOG_MESSAGES = 'RESET_DIALOG_MESSAGES';

export const getLotVisibility = (data, params) => {
    return APIAction(LOAD_LOT_VISIBILITY, 'get', '/landspot/visibility/lot/:id', data, params);
};

export const getLotPackages = (data, params) => {
    return APIAction(LOAD_LOT_PACKAGES, 'get', '/landspot/lot-package/?id=:id', data, params);
};

export const getLotPackagesForUpload = (query) => {
    return APIAction(LOAD_LOT_PACKAGES_FOR_UPLOAD, 'get', '/landspot/lot-package/', null, null, query);
};

export const deleteLotPackage = (data, params) => {
    return APIAction(DELETE_LOT_PACKAGE, 'delete', '/landspot/lot-package/:id', data, params);
};

export const updateLotPackages = (data, params) => {
    return APIAction(UPDATE_LOT_PACKAGES, 'put', '/landspot/lot-package/:id', data, params);
};

export const updateEstateDocuments = (data) => ({
    type: UPDATE_ESTATE_DOCUMENTS,
    payload: {data}
});

export const getEstateDocuments = (query) => {
    return APIAction(LOAD_ESTATE_DOCUMENTS, 'get', '/landspot/estate-package', null, null, query);
};

export const deleteEstateDocuments = (params) => {
    return APIAction(DELETE_ESTATE_PACKAGE, 'delete', '/landspot/estate-package/:id', null, params);
};

export const getPDFTemplate = (urlParams) => {
    return APIAction(LOAD_PDF_TEMPLATE, 'get', '/landspot/pdf-template/:id', null, urlParams);
};

export const updatePDFTemplate = (data, urlParams) => {
    return APIAction(UPDATE_PDF_TEMPLATE, 'put', '/landspot/pdf-template/:id', data, urlParams);
};

export const addEstate = (data) => {
    const url = '/landspot/estate';
    return APIAction(ADD_ESTATE, 'post', url, data);
};

export const updateLotVisibility = (data, params) => {
    return APIAction(UPDATE_LOT_VISIBILITY, 'put', '/landspot/visibility/lot/:id', data, params);
};

export const resetDialogStore = () => {
    return {type: RESET_DIALOG_STORE};
};

export const resetDialogMessages = () => {
    return {type: RESET_DIALOG_MESSAGES};
};