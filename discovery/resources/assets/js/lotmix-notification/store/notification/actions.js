import {APIAction} from '~/axios/api';

export const GET_LOTMIX_NOTIFICATIONS = 'GET_LOTMIX_NOTIFICATIONS';
export const CLOSE_LOTMIX_NOTIFICATION = 'CLOSE_LOTMIX_NOTIFICATION';

export const getLotmixNotification = () => {
    return APIAction(GET_LOTMIX_NOTIFICATIONS, 'get', '/lotmix-notification');
};

export const closeLotmixNotification = params => {
    const url = '/lotmix-notification/:id';
    return APIAction(CLOSE_LOTMIX_NOTIFICATION, 'post', url, null, params);
};
