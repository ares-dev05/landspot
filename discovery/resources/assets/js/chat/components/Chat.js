import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {isEqual} from 'lodash';
import {LeftPanel, RightPanel} from '~/helpers/Panels';

import * as storeActions from '../store/chat-store/actions/chat';

import {LoadingSpinner} from '~/helpers';
import ActiveChatDialog from './ActiveChatDialog';
import ChatDialogHeader from './ChatDialogHeader';
import ChatRecentDialogs from './ChatRecentDialogs';
import UsersDirectoryWithSearch from './user-directory/UsersDirectoryWithSearch';
import ContactsBook from './ContactsBook';
import ChatPubnub from './ChatPubnub';

import UserAction from './UserAction';

class Chat extends React.Component {

    static propTypes = {
        getChatUserData: PropTypes.func.isRequired,
        openChatChannel: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            userAction: null,
            userActionData: null,
            channels: [],
            isConnecting: false
        };

        this.refUsersDirectory = React.createRef();
    }

    componentDidMount() {
        this.props.getChatUserData();
        window.addEventListener('message', e => {
            if(e.data && e.data.event === 'minimizeChat') {
                this.setUserAction(null);
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        const {unreadMessages} = nextProps.chatData;
        const {unreadMessages: thisUnreadMessages} = this.props.chatData;
        const message = {};
        if (unreadMessages !== undefined &&
            unreadMessages !== thisUnreadMessages) {
            message.unreadMessages = unreadMessages;
        }

        if(Object.keys(message).length) {
            window.parent.postMessage(message, '*');
        }
    }

    componentWillUnmount() {}

    setUserAction = (action, actionData, noActionToggle) => {
        console.log('ACTION: ' + (action ? action.toString() : 'none'), actionData);

        const actionChanged = action !== this.state.userAction ||
            (actionData != null && !isEqual(actionData, this.state.userActionData));

        if (actionChanged) {
            this.setState({
                userAction: action,
                userActionData: actionData || null
            });
        } else if (!noActionToggle) {
            this.setState({
                userAction: null,
                userActionData: null
            });
            action = null;
        }

        this.onUserAction(action, actionData);
    };

    onUserAction(action, actionData) {
        if (action === UserAction.COMPOSE_NEW_MESSAGE && this.refUsersDirectory.current ||
            action === UserAction.OPEN_CONTACTS_BOOK) {
            this.props.resetDirectory();
        }
    }

    onUserSelect = (user) => {
        this.setUserAction(UserAction.OPEN_DIALOG_WITH_USER, {user}, true);
        this.props.openChatChannel(null, null, {user_id: user.id});
    };

    onChannelSelect = (channel_name) => {
        this.setUserAction(UserAction.OPEN_DIALOG_WITH_USER, {channel_name}, true);
        this.props.openChatChannel(null, null, {channel_name});
    };

    setConnectionState = (isConnecting) => {
        this.setState({isConnecting});
    };

    render() {
        const {user} = this.props.chatData;
        const {interlocutor} = this.props.activeChat;
        const {userAction, userActionData, isConnecting} = this.state;
        return user
            ? <React.Fragment>
                <ChatPubnub setConnectionState={this.setConnectionState}/>
                <div className="primary-container responsive-container">
                    <LeftPanel>
                        <ChatDialogHeader setUserAction={this.setUserAction}
                                          interlocutor={interlocutor}
                                          user={user}
                                          isConnecting={isConnecting}
                        />
                        <ChatRecentDialogs onChannelSelect={this.onChannelSelect}
                                           {...userActionData}/>
                    </LeftPanel>
                    <RightPanel>
                        <div className='chat-body'>
                            {
                                userAction === UserAction.COMPOSE_NEW_MESSAGE &&
                                <UsersDirectoryWithSearch companyType={user.company.type}
                                                          onUserSelect={this.onUserSelect}
                                                          {...this.props.chatData}
                                                          ref={this.refUsersDirectory}
                                />
                            }
                            {
                                userAction === UserAction.OPEN_CONTACTS_BOOK &&
                                <ContactsBook companyType={user.company.type}
                                              onUserSelect={this.onUserSelect}
                                              {...this.props.chatData}
                                />
                            }

                            {
                                userAction === UserAction.OPEN_DIALOG_WITH_USER &&
                                <ActiveChatDialog
                                    key={userActionData['channel_name']}
                                    {...userActionData}
                                />
                            }

                        </div>
                    </RightPanel>
                </div>
            </React.Fragment>
            : <LoadingSpinner/>;
    }
}

export default connect((state => ({
    chatData: state.chatData,
    activeChat: state.activeChat
})), storeActions)(Chat);