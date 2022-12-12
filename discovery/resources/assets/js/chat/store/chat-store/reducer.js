import * as chatActions from './actions/chat';
import * as directoryActions from './actions/directory';
import * as contactBookActions from './actions/contact-book';
import {success} from '~/axios/api';
import {pick} from 'lodash';
import {RECEIVED_CHANNEL_MESSAGE, RECEIVED_SYSTEM_MESSAGE} from '../channel/actions';
import * as channelActions from '../channel/actions';

export default (state = {
    user: null,
    userContacts: null,
    userObjectContacts: null,
    privateChannels: [],
    recentChats: []
}, action) => {
    let newState = {...state};

    switch (action.type) {
        case success(chatActions.GET_CHAT_USER_DATA):
        case success(chatActions.GET_RECENT_CHATS):
        case success(directoryActions.GET_DIRECTORY):
        case success(contactBookActions.GET_CONTACTS_BOOK):
        case success(directoryActions.GET_OBJECT_CONTACTS):
            return {...state, ...action.payload.data};

        case success(channelActions.SEND_MESSAGE):
        case success(chatActions.OPEN_CHAT_CHANNEL): {
            const data = pick(action.payload.data, 'privateChannels');
            return {...state, ...data};
        }

        case directoryActions.RESET_DIRECTORY:
            return {...state, ...{userContacts: null, userObjectContacts: null}};

        case RECEIVED_CHANNEL_MESSAGE:
            updateRecentChats(newState.recentChats, action.payload);
            return newState;

        case RECEIVED_SYSTEM_MESSAGE: {
            const {messageEvent} = action.payload;
            onSystemMessage(messageEvent, newState);
            return newState;
        }

        case success(channelActions.UPDATE_CHANNEL_READ_TIME): {
            const {data} = action.payload;
            updateRecentChatsReadAtTime(newState.recentChats, data, 'readed_at');
            if(data.unread_messages !== undefined) {
                newState.unreadMessages = data.unread_messages;
            }
            return newState;
        }
    }
    return state;
};

function onSystemMessage(messageEvent, newState) {
    if (!messageEvent) return;
    const {message, userMetadata} = messageEvent;
    let unreadMessages;

    switch (message.type) {
        case 'channel_read':
            updateRecentChatsReadAtTime(newState.recentChats, message, 'interlocutor_readed_at');
            if (userMetadata) {
                unreadMessages = userMetadata['unread_messages'];
            }
            break;

        case 'unread_messages':
            unreadMessages = message['unread_messages'];
            break;
    }

    if (unreadMessages !== undefined) {
        newState.unreadMessages = unreadMessages;
    }
}

function updateRecentChats(recentChats, payload) {
    const {messageEvent} = payload;
    if (messageEvent) {
        const chat = recentChats.find(chat => chat.chatChannel.channel_name === messageEvent.channel);
        if(chat) {
            const timetoken = messageEvent['timetoken'];
            chat.latestChannelMessage = {
                ...messageEvent.message,
                ...{
                    created_at: parseInt(timetoken) / 1e7,
                    timetoken
                }
            };
        }

        recentChats.sort(
            (first, second) => first.latestChannelMessage.created_at > second.latestChannelMessage.created_at ? 0 : 1
        );
    }
}

function updateRecentChatsReadAtTime(recentChats, data, key) {
    const {channels} = data;
    if (channels && channels.length) {
        recentChats.forEach((chat, index) => {
            const {channel_name} = chat.chatChannel;
            const channel = channels.find(item => item.channel === channel_name);
            if(channel) {
                recentChats[index][key] = channel.time;
            }
        });
    }
}