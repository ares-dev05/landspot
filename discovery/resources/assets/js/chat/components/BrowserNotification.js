import React, {Component} from 'react';
import {connect} from 'react-redux';
import store from '../store';
import * as actions from '../store/browserNotification/actions';

class BrowserNotification extends Component {
    constructor(props) {
        super(props);
        this.visibilityAttribute = ['hidden', 'msHidden', 'webkitHidden'].find(attribute => attribute in document);
    }

    componentDidMount() {
        if (!('Notification' in window)) {
            console.error('This browser does not support desktop notification');
            return;
        }

        window.addEventListener('message', this.messageHandler);

        const {
            browserNotification: {message},
            getBrowserNotificationChannels
        } = this.props;

        if (message) {
            this.showNotification({text: message}, message.visibility);

            store.dispatch({type: 'RESET_BROWSER_NOTIFICATION'});
        }

        getBrowserNotificationChannels();

    }


    messageHandler = (e) => {
        const newMessageHandler = this.newMessageHandler;

        if (e.data) {
            const {unreadMessages, newPrivateMessage} = e.data;
            if (isFinite(unreadMessages)) {
                newMessageHandler(unreadMessages);
            }
            if (newPrivateMessage) {
                this.showNotification({...newPrivateMessage, ...{isChatMsg: true}}, true);
            }
        }
    };

    newMessageHandler = (unreadMessagesCount) => {
        store.dispatch({type: 'SET_CHAT_UNREAD_MESSAGES_COUNT', payload: {unreadMessagesCount}});
    };

    componentDidUpdate() {
        const {
            browserNotification: {estateChannels, CHANNELS_UPDATED}
        } = this.props;

        if (CHANNELS_UPDATED) {
            try {
                if (window.pusherSocket && estateChannels) {

                    this.pusherChannel = window.pusherSocket;

                    estateChannels.map(channel => this.pusherChannel.subscribe(`browserNotification.${channel}`));

                    this.pusherChannel.bind('App\\Events\\BrowserNotification', e => {
                        this.showNotification(e.message, true);
                    });
                }
            }
            catch (e) {
            }

            store.dispatch({type: 'RESET_CHANNELS_UPDATED'})
        }
    }

    componentWillUnmount() {
        window.removeEventListener('message', this.messageHandler);
        if (this.pusherChannel) {
            try {
                this.pusherChannel.unbind();
            } catch (e) {
            }
        }
    }

    static createNotification({text, title, icon, image, onClickUrl, isChatMsg}) {
        const notification = new window.Notification(title, {body: text, icon, image});
        if (onClickUrl || isChatMsg) {
            notification.onclick = (function (url) {
                return function (e) {
                    e.preventDefault();
                    window.focus();
                    if (onClickUrl) {
                        window.location = url;
                    }

                    if (isChatMsg) {
                        store.dispatch({type: 'SET_MINIMIZED_STATE'});
                    }
                }
            })(onClickUrl, isChatMsg);
        }
        setTimeout(() => notification.close(), 10000);
    }

    isPageVisible = () => {
        return this.visibilityAttribute && document[this.visibilityAttribute];
    };

    showNotification = (message, checkVisibility) => {
        const {Notification} = window;
        if (Notification) {
            if (Notification.permission === 'granted') {
                if (!checkVisibility || checkVisibility && !this.isPageVisible()) {
                    BrowserNotification.createNotification(message);
                }
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted' && (
                        !checkVisibility || checkVisibility && !this.isPageVisible()
                    )) {
                        BrowserNotification.createNotification(message);
                    }
                });
            }
        }
    };

    render() {
        return null;
    }
}

export default connect((
    state => ({
        browserNotification: state.browserNotification,
    })
), actions)(BrowserNotification);