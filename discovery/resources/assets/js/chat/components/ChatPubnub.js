import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import * as storeActions from '../store/chat-store/actions/chat';
import store from '../store';

import PubNub from 'pubnub';
import QuillDeltaToHtmlConverter from 'quill-delta-to-html';

import {concat} from 'lodash';
import {RECEIVED_CHANNEL_MESSAGE, RECEIVED_SYSTEM_MESSAGE} from '../store/channel/actions';

class ChatPubnub extends React.Component {
    static propTypes = {
        getRecentChats: PropTypes.func.isRequired,
        setConnectionState: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.pubnub = null;
        this.connectedChannels = {};
        this.pendingChannelsToSubscribe = new Set();
        this.state = {};
    }

    componentWillMount() {
        try {
            const {user_unique_id} = this.props.chatData.user;
            this.pubnub = new PubNub({
                subscribeKey: process.env.MIX_PUBNUB_SUBSCRIBE_KEY,
                publishKey: process.env.MIX_PUBNUB_PUBLISH_KEY,
                authKey: this.props.chatData.user['user_unique_id'],
                uuid: `${user_unique_id}-web`,
                ssl: true,
                keepAlive: true
            });

            this.pubnub.addListener({
                message: m => this.onMessageListener(m),
                presence: function (p) {
                    // handle presence
                    // var action = p.action; // Can be join, leave, state-change or timeout
                    // var channelName = p.channel; // The channel for which the message belongs
                    // var occupancy = p.occupancy; // No. of users connected with the channel
                    // var state = p.state; // User State
                    // var channelGroup = p.subscription; //  The channel group or wildcard subscription match (if exists)
                    // var publishTime = p.timestamp; // Publish timetoken
                    // var timetoken = p.timetoken;  // Current timetoken
                    // var uuid = p.uuid; // UUIDs of users who are connected with the channel
                    console.log('presence', p);
                },
                status: s => this.onPresenceStatusListener(s)
            });
        } catch (e) {
            console.log('PubNub initalization error: ' + e.toString());
        }
    }

    onMessageListener(messageEvent) {
        const {user, recentChats} = this.props.chatData;
        console.log('message', messageEvent);

        const isSystemMessage = messageEvent.channel.indexOf('common-') === 0;

        if (isSystemMessage) {
            store.dispatch({type: RECEIVED_SYSTEM_MESSAGE, payload: {messageEvent}});
            this.onSystemMessageListener(messageEvent);
        } else {
            store.dispatch({type: RECEIVED_CHANNEL_MESSAGE, payload: {messageEvent}});
            if (recentChats.findIndex(chat => chat.chatChannel.channel_name === messageEvent.channel) === -1) {
                this.props.getRecentChats();
            }

            if (messageEvent.userMetadata &&
                user['id'] !== messageEvent.userMetadata['sender_id']) {
                this.sendBrowserNotificationMessage(messageEvent.message, messageEvent.userMetadata['sender_id']);
            }
        }
    }

    sendBrowserNotificationMessage({message}, senderId) {
        const chat = this.props.chatData.recentChats.find(chat => chat.user.id === senderId);
        Promise.resolve().then(() => {
            try {
                const converter = new QuillDeltaToHtmlConverter(JSON.parse(message), {});
                converter.afterRender(function (group, htmlString) {
                    return htmlString.replace(/<\/?[^>]*>/g, ' ');
                });
                message = converter.convert();
            } catch (e) {
                message = message.replace('<', '&lt;').replace('>', '&gt;');
            }
            const newPrivateMessage = {
                title: chat ? chat.user.display_name : null,
                icon: chat ? chat.user.avatar : null,
                text: message
            };

            window.parent.postMessage({
                newPrivateMessage
            }, '*');
        });
    }

    onSystemMessageListener(messageEvent) {
        const {message} = messageEvent;
        if (!message) {
            return;
        }
        const {channel} = message;
        console.log('system message', messageEvent);
        switch (message.type) {
            case 'new_channel':
                this.subscribeChannels(channel);
                break;
        }
    }

    onPresenceStatusListener(status) {
        console.log('status', status);
        if (status.error) {
            return;
        }
        const {operation, subscribedChannels} = status;
        // var affectedChannelGroups = s.affectedChannelGroups;
        // var category = s.category;
        // var operation = s.operation;
        if (operation === 'PNSubscribeOperation') {
            if (subscribedChannels) {
                subscribedChannels.forEach(channel => {
                    this.connectedChannels[channel] = true;
                    this.pendingChannelsToSubscribe.delete(channel);
                });
                console.log('subscribed to ', subscribedChannels);

                if (!this.pendingChannelsToSubscribe.size) {
                    this.props.setConnectionState(false);
                }
            }
        }
    }

    componentDidMount() {
        const {privateChannels} = this.props.chatData;
        this.subscribeChannels(privateChannels);
        this.subscribeChannelsTimer = setInterval(() => this.subscribeChannelsFunction(), 10000);
    }

    componentWillUnmount() {
        if (this.pubnub) {
            this.pubnub.unsubscribeAll();
        }
        clearInterval(this.subscribeChannelsTimer);
    }

    subscribeChannelsFunction() {
        if (this.pendingChannelsToSubscribe.size) {
            const channels = [...this.pendingChannelsToSubscribe]
                .reduce((accumulator, channel) => {
                        if (this.connectedChannels[channel]) {
                            this.pendingChannelsToSubscribe.delete(channel);
                        } else {
                            accumulator.push(channel);
                        }
                        return accumulator;
                    }, []
                );

            if (channels.length) {
                this.pubnub.subscribe({
                    channels: channels,
                    withPresence: true
                });
                console.log('subscribing to ', channels);
                this.props.setConnectionState(true);
            }
        }
    }

    /*updateChannel = (message) => {
        let {channel} = this.props.activeChat;
        if (channel && channel['channel_name'] === message[0]['channel']['channel_name']) {
            channel['last_channel_message'] = concat(channel['last_channel_message'], message);
            store.dispatch({type: success(storeActions.OPEN_CHAT_CHANNEL), payload: {channel}});
        }
    };*/

    componentWillReceiveProps(nextProps) {
        const {privateChannels} = nextProps.chatData;
        this.subscribeChannels(privateChannels);
    }

    subscribeChannels = (channels) => {
        if (channels && channels.length) {
            channels.forEach(channel => this.pendingChannelsToSubscribe.add(channel));
            setTimeout(() => this.subscribeChannelsFunction(), 0);
        }
    };

    render() {
        return null;
    }
}

export default connect((state => ({
    chatData: state.chatData,
    activeChat: state.activeChat
})), storeActions)(ChatPubnub);