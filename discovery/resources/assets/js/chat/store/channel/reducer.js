import * as chatActions from '../chat-store/actions/chat';
import * as channelActions from './actions';
import {success} from '~/axios/api';
import {pick} from 'lodash';
import {RECEIVED_CHANNEL_MESSAGE} from './actions';

const defaultState = {
    channel: null,
    interlocutor: null,
};

export default (state = defaultState, action) => {
    let newState = {...state};
    const {channel} = newState;

    switch (action.type) {
        case success(channelActions.SEND_MESSAGE):
        case success(chatActions.OPEN_CHAT_CHANNEL): {
            const data = pick(action.payload.data, ['channel', 'interlocutor']);
            return {...state, ...data};
        }

        case success(channelActions.UPDATE_CHANNEL_READ_TIME): {
            const {channels} = action.payload.data;
            if(channels && channels.length) {
                Object.assign(newState.channel, {readed_at: channels[0].time});
            }
            return newState;
        }

        case chatActions.LEAVE_ACTIVE_CHAT:
            return defaultState;

        case RECEIVED_CHANNEL_MESSAGE: {
            const {messageEvent} = action.payload;

            if (channel && messageEvent && messageEvent.userMetadata &&
                messageEvent.channel === channel.channel_name &&
                channel['last_channel_message']) {
                const timetoken = messageEvent['timetoken'];
                let newMessage = {
                    ...messageEvent.message,
                    ...{
                        created_at: parseInt(timetoken) / 1e7,
                        timetoken
                    }
                };

                channel['last_channel_message'].push(newMessage);
                if (channel['last_channel_message'].length > 100) {
                    channel['last_channel_message'] = channel['last_channel_message'].slice(-100);
                }
            }
            return newState;
        }

        case success(channelActions.LOAD_CHANNEL_HISTORY_PREPEND): {
            const {last_channel_message, endHistory} = action.payload.data;
            if (channel && channel.last_channel_message && last_channel_message) {
                channel.last_channel_message = last_channel_message.concat(channel.last_channel_message);
            }
            channel.endHistory = endHistory;
            return newState;
        }

        case success(channelActions.LOAD_CHANNEL_HISTORY):
            if(channel) {
                channel.last_channel_message = action.payload.data.last_channel_message;
            }
        return newState;
    }
    return state;
};