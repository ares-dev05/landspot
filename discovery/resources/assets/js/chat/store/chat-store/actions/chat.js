export const GET_CHAT_USER_DATA = 'GET_CHAT_USER_DATA';
export const OPEN_CHAT_CHANNEL = 'OPEN_CHAT_CHANNEL';
export const LEAVE_ACTIVE_CHAT = 'LEAVE_ACTIVE_CHAT';
export const GET_RECENT_CHATS = 'GET_RECENT_CHATS';

export const endPoint = '/live-chat';

export const getChatUserData = () => {
    return {
        type: GET_CHAT_USER_DATA,
        payload: {
            url: endPoint
        }
    };
};


export const openChatChannel = (data, urlParams, query) => {
    return {
        type: OPEN_CHAT_CHANNEL,
        payload: {
            method: 'post',
            url: `${endPoint}`,
            data,
            urlParams,
            query
        }
    };
};

export const getRecentChats = () => {
    return {
        type: GET_RECENT_CHATS,
        delay: 1000,
        payload: {
            method: 'get',
            url: `${endPoint}/list-recent-channels`
        }
    };
};

export {resetDirectory} from './directory';
export {getContactsBook} from './contact-book';
