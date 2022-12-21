import {APIAction} from '~/axios/api';

export const GET_BROWSER_NOTIFICATION_CHANNELS = 'GET_BROWSER_NOTIFICATION_CHANNELS';

export const getBrowserNotificationChannels = () => {
    const url = '/landspot/browser-notification-channels';
    return APIAction(GET_BROWSER_NOTIFICATION_CHANNELS, 'post', url);
};