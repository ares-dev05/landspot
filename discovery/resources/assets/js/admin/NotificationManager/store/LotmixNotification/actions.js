import {APIAction} from '~/axios/api';
import {put} from 'redux-saga/effects';

export const FETCH_LOTMIX_NOTIFICATIONS    = 'FETCH_LOTMIX_NOTIFICATIONS';
export const FETCH_LOTMIX_NOTIFICATION     = 'FETCH_LOTMIX_NOTIFICATION';
export const CREATE_LOTMIX_NOTIFICATION    = 'CREATE_LOTMIX_NOTIFICATION';
export const REMOVE_LOTMIX_NOTIFICATION    = 'REMOVE_LOTMIX_NOTIFICATION';
export const EDIT_LOTMIX_NOTIFICATION      = 'EDIT_LOTMIX_NOTIFICATION';
export const SEND_LOTMIX_NOTIFICATION      = 'SEND_LOTMIX_NOTIFICATION';


export const fetchLotmixNotifications = query => {
    const url = '/landspot/notifications/lotmix-notification';
    return APIAction(FETCH_LOTMIX_NOTIFICATIONS, 'get', url, null, null, query);
};

export const fetchLotmixNotification = (params, query) => {
    const url = '/landspot/notifications/lotmix-notification/:notificationId';
    return APIAction(FETCH_LOTMIX_NOTIFICATION, 'get', url, null, params, query);
};

export const createLotmixNotification = data => {
    const url = '/landspot/notifications/lotmix-notification';
    return APIAction(CREATE_LOTMIX_NOTIFICATION, 'post', url, data);
};

export const editLotmixNotification = (data, params) => {
    const url = '/landspot/notifications/lotmix-notification/:notificationId';
    return APIAction(EDIT_LOTMIX_NOTIFICATION, 'put', url, data, params);
};

export const removeLotmixNotification = params => {
    const url = '/landspot/notifications/lotmix-notification/:notificationId';
    return APIAction(REMOVE_LOTMIX_NOTIFICATION, 'delete', url, null, params);
};

export const sendLotmixNotification = params => {
    const url = '/landspot/notifications/lotmix-notification/send/:notificationId';
    let action = APIAction(SEND_LOTMIX_NOTIFICATION, 'get', url, null, params);
    action.onSuccess = function* () {
        yield put(fetchLotmixNotifications());
    };
    return action;
};
