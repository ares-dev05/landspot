import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import QuillDeltaToHtmlConverter from 'quill-delta-to-html';
import * as storeActions from '../store/chat-store/actions/chat';

import {dateFormat} from '~/helpers';
import UserAvatar from './UserAvatar';

class ChatRecentDialogs extends React.Component {

    static propTypes = {
        openChatChannel: PropTypes.func.isRequired,
        onChannelSelect: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
    }

    render() {
        const {recentChats}  = this.props.chatData;
        const {channel_name: activeChannel} = this.props;
        return <div className='recent-messages-wrapper'>
            {
                recentChats.length > 0
                    ? <div className="chat-recent-dialogs">
                        {
                            recentChats.map(
                                chat => {
                                    const {channel_name} = chat['chatChannel'];
                                    const isActive = channel_name === activeChannel;
                                    return <RecentDialog
                                        key={`${channel_name}-${chat.latestChannelMessage.timetoken}`}
                                        {...chat}
                                        isActive={isActive}
                                        onClick={() => this.props.onChannelSelect(channel_name)}
                                    />;
                                }
                            )
                        }
                    </div>
                    : <div className='no-results'><i>No recent dialogs</i></div>
            }
        </div>;
    }
}

const RecentDialog = ({latestChannelMessage, chatChannel, user, onClick, readed_at, interlocutor_readed_at, isActive}) => {
    const sendByMe = latestChannelMessage.user_id !== user.id;
    const isUnread = sendByMe && interlocutor_readed_at < latestChannelMessage['created_at'];
    const isNewMessage = !sendByMe && readed_at < latestChannelMessage['created_at'];

    let html = latestChannelMessage['message'];
    try {
        const converter = new QuillDeltaToHtmlConverter(JSON.parse(html), {});
        converter.afterRender(function (group, htmlString) {
            return htmlString.replace(/<\/?[^>]*>/g, ' ');
        });
        html = converter.convert();
    } catch (e) {
        html = html.replace('<', '&lt;').replace('>', '&gt;');
    }

    return <div className={classnames('recent-dialog', isActive ? 'active' : '')} onClick={onClick}>
        <UserAvatar {...user}/>
        <div className='message-box'>
            <div className='title'>{user.display_name}</div>
            <div className='message-preview'>
                {sendByMe && <span className='me'>You: </span>}
                <span dangerouslySetInnerHTML={{__html: html}}/>
            </div>
            <div className='time'>
                {dateFormat(latestChannelMessage['created_at'])}
            </div>
        </div>
        {
            isUnread &&
            <i className="fa fa-circle is-unread"/>
        }
        {
            isNewMessage &&
            <i className="fal fa-envelope has-new-message"/>
        }
    </div>;
};


export default connect(
    (state => ({chatData: state.chatData})), storeActions
)(ChatRecentDialogs);
