import classnames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {clickHandler} from '~/helpers';
import store from '../store';

class MinimisedChat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            minimisedState: true,
            unreadMessages: null,
        };

        this.refChatWindow = React.createRef();
    }

    static getDerivedStateFromProps(props) {
        if (props.minimizedChat.changeMinimisedState) {
            store.dispatch({type: 'RESET_MINIMIZED_STATE'});
            return {minimisedState: false};
        }

        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        const {minimisedState} = this.state;
        if (minimisedState && minimisedState !== prevState.minimisedState && this.refChatWindow.current) {
            this.refChatWindow.current.contentWindow.postMessage({event: 'minimizeChat'}, '*');
        }
    }


    toggleChat = (minimisedState) => {
        this.setState({minimisedState});
    };

    render() {
        const {minimisedState} = this.state;
        const {unreadMessagesCount} = this.props.minimizedChat;
        const isUnreadMessages = unreadMessagesCount !== null;
        return (
            <React.Fragment>
                {
                    ReactDOM.createPortal(
                        <React.Fragment>
                            <div className="fullpage-messenger" style={{display: minimisedState ? 'none' : 'block'}}>
                                <iframe src="/live-chat"
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        ref={this.refChatWindow}
                                />
                            </div>
                        </React.Fragment>,
                        document.getElementById('wrapper') || document.getElementById('chat-wrapper')
                    )
                }
                {
                    <a href="#"
                       onClick={e => isUnreadMessages ? clickHandler(e, this.toggleChat, [!minimisedState]) : clickHandler(e)}
                    >
                        <i className="landspot-icon comment"/>
                        {
                            isUnreadMessages &&
                            <span className={classnames('counter', unreadMessagesCount !== 0 && 'pulse')}>
                                {unreadMessagesCount}
                            </span>
                        }
                    </a>
                }
            </React.Fragment>
        );
    }
}

export default connect((state => ({minimizedChat: state.minimizedChat})))(MinimisedChat);