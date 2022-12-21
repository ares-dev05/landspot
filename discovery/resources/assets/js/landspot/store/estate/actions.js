import {APIAction} from '~/axios/api';

export const MOVE_COLUMN = 'MOVE_COLUMN';
export const REMOVE_COLUMN = 'REMOVE_COLUMN';
export const ADD_COLUMN = 'ADD_COLUMN';
export const RENAME_COLUMN = 'RENAME_COLUMN';
export const ADD_LOT = 'ADD_LOT';
export const ADD_STAGE = 'ADD_STAGE';
export const DELETE_STAGE = 'DELETE_STAGE';
export const UPDATE_LOT = 'UPDATE_LOT';
export const REMOVE_LOT = 'REMOVE_LOT';
export const UPDATE_ESTATE = 'UPDATE_ESTATE';
export const UPDATE_ESTATE_DESCRIPTION = 'UPDATE_ESTATE_DESCRIPTION';
export const UPDATE_STAGE = 'UPDATE_STAGE';
export const GET_ESTATE_LOTS = 'GET_ESTATE_LOTS';
export const RESET_ESTATE_DATA = 'RESET_ESTATE_DATA';
export const RESET_POPUP_MESSAGES = 'RESET_POPUP_MESSAGES';
export const SAVE_PRICE_LIST = 'SAVE_PRICE_LIST';
export const DELETE_ESTATE_IMAGE = 'DELETE_ESTATE_IMAGE';
export const PUSH_ESTATE_GALLERY = 'PUSH_ESTATE_GALLERY';
export const ADD_AMENITY = 'ADD_AMENITY';
export const UPDATE_LOTMIX_LOT_VISIBILITY = 'UPDATE_LOTMIX_LOT_VISIBILITY';
export const UPDATE_SNAPSHOTS = 'UPDATE_SNAPSHOTS';
export const UPDATE_ANSWERS = 'UPDATE_ANSWERS';
export const BULK_UPDATE_LOT = 'BULK_UPDATE_LOT';

export const moveColumn = data => {
    const url = '/landspot/move-column';
    return APIAction(MOVE_COLUMN, 'post', url, data);
};

export const updateEstate = (data, params) => {
    const url = '/landspot/estate/:id';
    return APIAction(UPDATE_ESTATE, 'put', url, data, params);
};

export const updateEstateDescription = (data, params) => {
    const url = '/landspot/estate/:id/estate-description';
    return APIAction(UPDATE_ESTATE_DESCRIPTION, 'put', url, data, params);
};

export const pushEstateGallery = gallery => {
    return {type: PUSH_ESTATE_GALLERY, payload: gallery};
};

export const addStage = (data, params) => {
    const url = '/landspot/add-stage/:id';
    return APIAction(ADD_STAGE, 'post', url, data, params);
};

export const addAmenity = (data, params) => {
    const url = '/landspot/estate/:id/add-amenity';
    return APIAction(ADD_AMENITY, 'post', url, data, params);
};

export const updateStage = (data, params) => {
    const url = '/landspot/update-stage/:id';
    return APIAction(UPDATE_STAGE, 'put', url, data, params);
};

export const deleteEstateImage = params => {
    const url = '/landspot/estate/:estateId/estate-gallery/:imageId';
    return APIAction(DELETE_ESTATE_IMAGE, 'delete', url, null, params);
};

export const removeStage = (data, params) => {
    return APIAction(
        DELETE_STAGE,
        'delete',
        '/landspot/remove-stage/:id',
        data,
        params
    );
};

export const removeColumn = (data, params) => {
    return APIAction(
        REMOVE_COLUMN,
        'delete',
        '/landspot/remove-column/:id',
        data,
        params
    );
};

export const addColumn = data => {
    const url = '/landspot/add-column/';
    return APIAction(ADD_COLUMN, 'put', url, data);
};

export const renameColumn = (data, params) => {
    const url = '/landspot/rename-column/:columnId';
    return APIAction(RENAME_COLUMN, 'put', url, data, params);
};

export const addLot = (data, params) => {
    return APIAction(ADD_LOT, 'post', '/landspot/lot?stage=:id', data, params);
};

export const updateLot = (data, params) => {
    return APIAction(UPDATE_LOT, 'put', '/landspot/lot/:id', data, params);
};

export const bulkUpdateLot = (data, params) => {
    return APIAction(BULK_UPDATE_LOT, 'put', '/landspot/lot/bulk-update', data, params);
};

export const updateLotmixVisibility = (data, params) => {
    return APIAction(UPDATE_LOTMIX_LOT_VISIBILITY, 'post', '/landspot/lotmix-lot-visibility/:id', data, params);
};

export const removeLot = (data, params) => {
    return APIAction(REMOVE_LOT, 'delete', '/landspot/lot/:id', data, params);
};

export const getEstateLots = (params, query) => {
    const url = '/landspot/estate/:id';
    return APIAction(GET_ESTATE_LOTS, 'get', url, null, params, query);
};

export const savePriceList = (data, params) => {
    const url = '/landspot/save-price-list/:id';
    return APIAction(SAVE_PRICE_LIST, 'post', url, data, params);
};

export const resetEstateData = () => {
    return APIAction(RESET_ESTATE_DATA);
};

export const updateSnapshots = (data, params) => {
    const url = '/landspot/estate/:id/update-snapshots';
    return APIAction(UPDATE_SNAPSHOTS, 'post', url, data, params);
};

export const updateAnswers = (data, params) => {
    const url = '/landspot/estate/:id/update-answers';
    return APIAction(UPDATE_ANSWERS, 'post', url, data, params);
};