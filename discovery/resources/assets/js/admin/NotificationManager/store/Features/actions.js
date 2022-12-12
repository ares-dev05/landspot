import {APIAction} from '~/axios/api';
import {put} from 'redux-saga/effects';

export const FETCH_COMPANIES                = 'FETCH_COMPANIES';
export const FETCH_FEATURE_NOTIFICATIONS    = 'FETCH_FEATURE_NOTIFICATIONS';
export const FETCH_FEATURE_NOTIFICATION     = 'FETCH_FEATURE_NOTIFICATION';
export const CREATE_FEATURE_NOTIFICATION    = 'CREATE_FEATURE_NOTIFICATION';
export const REMOVE_FEATURE_NOTIFICATION    = 'REMOVE_FEATURE_NOTIFICATION';
export const EDIT_FEATURE_NOTIFICATION      = 'EDIT_FEATURE_NOTIFICATION';
export const SEND_FEATURE_NOTIFICATION      = 'SEND_FEATURE_NOTIFICATION';

export const fetchCompanies = (params, query) => {
    const url = '/landspot/notifications/features/companies';
    return APIAction(FETCH_COMPANIES, 'get', url, null, params, query);
};

export const fetchFeatureNotifications = (query) => {
    const url = '/landspot/notifications/features';
    return APIAction(FETCH_FEATURE_NOTIFICATIONS, 'get', url, null, null, query);
};

export const fetchFeatureNotification = (params, query) => {
    const url = '/landspot/notifications/features/:notificationId';
    return APIAction(FETCH_FEATURE_NOTIFICATION, 'get', url, null, params, query);
};

export const createFeatureNotification = (data) => {
    const url = '/landspot/notifications/features';
    return APIAction(CREATE_FEATURE_NOTIFICATION, 'post', url, data);
};

export const editFeatureNotification = (data, params) => {
    const url = '/landspot/notifications/features/:notificationId';
    return APIAction(EDIT_FEATURE_NOTIFICATION, 'put', url, data, params);
};

export const removeFeatureNotification = (params) => {
    const url = '/landspot/notifications/features/:notificationId';
    return APIAction(REMOVE_FEATURE_NOTIFICATION, 'delete', url, null, params);
};

export const sendFeatureNotification = (params) => {
    const url = '/landspot/notifications/features/send/:notificationId';
    let action = APIAction(SEND_FEATURE_NOTIFICATION, 'get', url, null, params);
    action.onSuccess = function* () {
        yield put(fetchFeatureNotifications());
    };
    return action;
};
