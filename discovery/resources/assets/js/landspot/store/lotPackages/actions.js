import {APIAction} from '~/axios/api';

export const LOAD_LOT_PACKAGES_FOR_VIEW = 'LOAD_LOT_PACKAGES_FOR_VIEW';

export const getLotPackagesForView = (params, query) => {
    return APIAction(LOAD_LOT_PACKAGES_FOR_VIEW, 'get', '/landspot/view-packages/:estateId', null, params, query);
};
