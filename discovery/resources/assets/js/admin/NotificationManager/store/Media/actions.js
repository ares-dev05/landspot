import {APIAction} from '~/axios/api';

export const FETCH_NOTIFICATION_MEDIA  = 'FETCH_NOTIFICATION_MEDIA';
export const REMOVE_NOTIFICATION_MEDIA = 'REMOVE_NOTIFICATION_MEDIA';

export const fetchNotificationMedia = (query) => {
    const url = '/landspot/notifications/media-file';
    return APIAction(FETCH_NOTIFICATION_MEDIA, 'get', url, null, null, query);
};

export const removeNotificationMedia = (params) => {
    const url = '/landspot/notifications/media-file/:mediaId';
    return APIAction(REMOVE_NOTIFICATION_MEDIA, 'delete', url, null, params);
};