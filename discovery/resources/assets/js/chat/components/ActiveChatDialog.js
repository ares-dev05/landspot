import classnames from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import QuillDeltaToHtmlConverter from 'quill-delta-to-html';

import * as channelActions from '../store/channel/actions';
import store from '../store';
import * as storeActions from '../store/chat-store/actions/chat';
import {LoadingSpinner, dateFormat} from '~/helpers';
import NewMessageForm from './NewMessageEditor';
import UserAvatar from './UserAvatar';

const messageHeight = 100;
const serverMessagesLimit = 100;

class ActiveChatDialog extends React.Component {
    static propTypes = {
        user: PropTypes.object,
        channel_name: PropTypes.string,
        getChannelHistory: PropTypes.func.isRequired,
        updateChannelReadTime: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.chatHistoryEl = null;

        this.state = {
            isLoadingMessages: false,
            firstUnreadMessageTime: null,
            lastUnreadMessageTime: null,
            lastMessagesLength: null,
        };

        this.autoScroll      = true;
        this.minMessageTime  = null;
        this.currentPosition = null;
    }

    componentWillReceiveProps(nextProps) {
        const nextChannel = nextProps.activeChat.channel;
        const currentChannel = this.props.activeChat.channel;

        this.setState({isLoadingMessages: false});

        if (nextChannel && !currentChannel) {
            const {channel_name, last_channel_message, endHistory} = nextChannel;

            if (last_channel_message.length) {
                const lastMessage = last_channel_message[last_channel_message.length - 1];
                if (lastMessage.created_at > nextChannel.readed_at) {
                    this.props.updateChannelReadTime({channel_name});
                }

                const firstMessage = last_channel_message[0];

                if (firstMessage.created_at > nextChannel.readed_at) {
                    this.setState({
                        firstUnreadMessageTime: firstMessage.timetoken
                    });
                }

                if (this.minMessageTime === null && last_channel_message.length < serverMessagesLimit) {
                    this.minMessageTime = firstMessage.timetoken;
                    if(this.chatHistoryEl) this.chatHistoryEl.scrollTop = messageHeight / 2;
                }

                if (endHistory) {
                    this.minMessageTime = firstMessage.timetoken;
                }

                this.setState({lastMessagesLength: last_channel_message.length});
            }
        }

        if (nextChannel && currentChannel && this.chatHistoryEl) {
            const {last_channel_message, endHistory} = nextChannel;
            if (last_channel_message.length) {
                const firstMessage = last_channel_message[0];
                const lastMessage = last_channel_message[last_channel_message.length - 1];
                if (lastMessage.created_at > nextChannel.readed_at &&
                    nextProps.chatData.user.id !== lastMessage.user_id
                ) {
                    const {scrollTop, offsetHeight, scrollHeight} = this.chatHistoryEl;

                    if (scrollTop < scrollHeight - offsetHeight) {
                        this.autoScroll = false;
                        this.setState({lastUnreadMessageTime: lastMessage.created_at});
                    }
                }
                if (this.minMessageTime === null && last_channel_message.length < serverMessagesLimit) {
                    this.minMessageTime = firstMessage.timetoken;
                    if(this.chatHistoryEl) this.chatHistoryEl.scrollTop = messageHeight / 2;
                }

                if (endHistory) {
                    this.minMessageTime = firstMessage.timetoken;
                }

                this.setState({lastMessagesLength: last_channel_message.length});
            }
        }
    }

    componentWillUnmount() {
        store.dispatch({type: storeActions.LEAVE_ACTIVE_CHAT, payload: {}});
    }

    componentDidUpdate(prevProps, prevState) {
        const {lastMessagesLength} = this.state;
        const {lastMessagesLength: prevMessagesLength} = prevState;
        if (this.autoScroll) {
            this.scrollToBottom();
        }

        if(this.currentPosition && lastMessagesLength !== prevMessagesLength) {
            this.scrollToPosition(this.currentPosition);
            this.currentPosition = null;
        }
    }

    scrollToPosition = (position) => {
        const history = this.chatHistoryEl;
        if (!history) {
            return;
        }
        history.scrollTop = history.scrollHeight - position;
    };

    scrollToBottom = () => {
        const history = this.chatHistoryEl;
        if (!history) {
            return;
        }
        const scrollHeight = history.scrollHeight;
        if (history && history.scrollTop < scrollHeight) {
            history.scrollTop = scrollHeight;
        }
    };

    sendMessage = (message) => {
        const {channel_name} = this.props.activeChat.channel;
        if (message !== '') {
            this.props.sendMessage({message}, {channel_name});
            this.autoScroll = true;

            this.setState({
                lastUnreadMessageTime: null,
            });
        }
    };

    onChatScroll = () => {
        if (!this.chatHistoryEl) {
            return;
        }

        let {scrollTop, scrollHeight, offsetHeight} = this.chatHistoryEl;
        const {lastUnreadMessageTime} = this.state;
        scrollTop = Math.floor(scrollTop);
        //Load old history
        if (this.chatHistoryEl.scrollTop === 0) {
            this.autoScroll = false;

            const {channel_name, last_channel_message} = this.props.activeChat.channel;
            if (last_channel_message.length) {
                const time = last_channel_message[0].timetoken;
                if (!this.minMessageTime || time > this.minMessageTime) {
                    this.setState({isLoadingMessages: true});
                    this.props.getChannelHistory({channel_name, max_time: time});

                    this.currentPosition = scrollHeight;
                }
            }
        }

        if (scrollTop && scrollTop >= scrollHeight - messageHeight) {
            this.autoScroll = true;
        }

        if (lastUnreadMessageTime && (Math.round(Math.abs(scrollTop - scrollHeight + offsetHeight)) <= 1)) {
            this.setState({
                lastUnreadMessageTime: null,
            });
            this.autoScroll = true;

            this.onInputFocus();
        }
    };

    loadOldMessagesBanner = () => {
        const {firstUnreadMessageTime} = this.state;
        const {channel_name} = this.props.activeChat.channel;

        this.autoScroll = false;
        if (firstUnreadMessageTime) {
            this.setState({
                firstUnreadMessageTime: null,
                isLoadingMessages: true
            });
            this.props.getChannelHistory({channel_name, min_time: firstUnreadMessageTime});
        }

        if (this.chatHistoryEl) {
            this.chatHistoryEl.scrollTop = messageHeight;
        }
    };

    loadNewMessagesBanner = () => {
        const {lastUnreadMessageTime} = this.state;
        if (lastUnreadMessageTime) {
            this.setState({
                lastUnreadMessageTime: null,
                isLoadingMessages: true
            });
            this.autoScroll = true;
            const {channel_name} = this.props.activeChat.channel;
            this.props.getChannelHistory({channel_name, min_time: -1});
        }
    };

    onInputFocus = () => {
        const {channel} = this.props.activeChat;
        const {last_channel_message} = channel;
        if (last_channel_message.length) {
            const lastMessage = last_channel_message[last_channel_message.length - 1];
            if (lastMessage.user_id !== this.props.chatData.user.id &&
                lastMessage.created_at > channel.readed_at) {
                this.props.updateChannelReadTime({channel_name: channel.channel_name});
            }
        }
    };

    renderMessages = () => {
        const {channel, interlocutor} = this.props.activeChat;
        const {user} = this.props.chatData;

        const messages = channel['last_channel_message'].map(message => {
            const {timetoken, user_id} = message;
            const key = `${timetoken}-${user_id}`;

            return user_id === user['id']
                ? <ChatMyMessage key={key} message={message}/>
                : <ChatOtherMessage key={key} message={message} interlocutor={interlocutor}/>;
        });
        return messages.length ? messages : <div className='no-results'><i>No messages</i></div>;
    };

    render() {
        const {channel, interlocutor} = this.props.activeChat;

        const {firstUnreadMessageTime, lastUnreadMessageTime, isLoadingMessages} = this.state;

        return <div className='chat-dialog'>
                {
                    channel
                        ? <React.Fragment>
                            <header>
                                {interlocutor['display_name']}
                            </header>
                            <div className='chat-history'
                                 onScroll={this.onChatScroll}
                                 ref={e => this.chatHistoryEl = e}>
                                {/*{
                                    firstUnreadMessageTime && <JumpToUnreadMessages direction={'up'}
                                                                                    onClick={this.loadOldMessagesBanner}
                                    />
                                }*/}
                                {
                                    isLoadingMessages && <div className='loading-history'>Loading History...</div>
                                }
                                {
                                    this.renderMessages()
                                }
                                {
                                    isLoadingMessages && <LoadingSpinner className={'overlay'}/>
                                }
                                {
                                    lastUnreadMessageTime &&
                                    <JumpToUnreadMessages direction={'down'}
                                                          onClick={this.loadNewMessagesBanner}
                                    />
                                }
                            </div>
                            <NewMessageForm sendMessage={this.sendMessage}
                                            onFocus={this.onInputFocus}
                            />
                        </React.Fragment>
                        : <LoadingSpinner isStatic={true}/>
                }
            </div>;
    }
}

//firstUnreadMessageTime
const JumpToUnreadMessages = ({direction, onClick}) => {
    return <div className={classnames('jump-to-unread-messages', direction)}
                onClick={onClick}
    >
        <div className="line-start"/>
        <div className='unread-messages'>
            {
                direction === 'up' ? <i className='fal fa-arrow-circle-up'/> : <i className='fal fa-arrow-circle-down'/>
            }
            &nbsp;New messages
        </div>
        <div className="line-end"/>
    </div>;
};

const ChatMyMessage = ({message}) => {
    const html = prepareMessage(message);
    return <div className='my-message'>
        <div className='text' dangerouslySetInnerHTML={{__html: html}}/>
        <div className='time'>{dateFormat(message['created_at'])}</div>
    </div>;
};

const ChatOtherMessage = ({message, interlocutor}) => {
    const html = prepareMessage(message);
    return <div className='other-message'>
        <UserAvatar {...interlocutor}/>
        <div className='text' dangerouslySetInnerHTML={{__html: html}}/>
        <div className='time'>{dateFormat(message['created_at'])}</div>
    </div>;
};

const prepareMessage = (message) => {
    let html = message['message'];
    try {
        html = JSON.parse(html);
        if(typeof html !== 'number') {
            const converter = new QuillDeltaToHtmlConverter(html, {paragraphTag: ''});
            html = converter.convert();
        }
    } catch (e) {
        html = html.replace('<', '&lt;').replace('>', '&gt;');
    }
    return html;
};

export default connect(
    (state => ({
        chatData: state.chatData,
        activeChat: state.activeChat
    })), channelActions
)(ActiveChatDialog);
