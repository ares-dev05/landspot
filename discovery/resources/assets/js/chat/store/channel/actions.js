export const SEND_MESSAGE = 'SEND_MESSAGE';
export const LOAD_CHANNEL_HISTORY = 'LOAD_CHANNEL_HISTORY';
export const LOAD_CHANNEL_HISTORY_PREPEND = 'LOAD_CHANNEL_HISTORY_PREPEND';
export const RECEIVED_CHANNEL_MESSAGE = 'RECEIVED_CHANNEL_MESSAGE';
export const RECEIVED_SYSTEM_MESSAGE = 'RECEIVED_SYSTEM_MESSAGE';
export const UPDATE_CHANNEL_READ_TIME = 'UPDATE_CHANNEL_READ_TIME';

import {endPoint} from '../chat-store/actions/chat';

export const sendMessage = (data, urlParams) => {
    return {
        type: SEND_MESSAGE,
        payload: {
            method: 'put',
            url: `${endPoint}/:channel_name`,
            data,
            urlParams
        }
    };
};

export const getChannelHistory = (data) => {
    return {
        type: data.max_time ? LOAD_CHANNEL_HISTORY_PREPEND : LOAD_CHANNEL_HISTORY,
          payload: {
            method: 'post',
            url: `${endPoint}/channel-history`,
            data
        }
    };
};

export const updateChannelReadTime = (urlParams) => {
    return {
        type: UPDATE_CHANNEL_READ_TIME,
        payload: {
            method: 'put',
            url: `${endPoint}/channel-read/:channel_name`,
            urlParams
        }
    };
};