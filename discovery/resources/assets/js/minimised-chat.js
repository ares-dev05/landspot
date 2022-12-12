import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux'
import BrowserNotification from './chat/components/BrowserNotification';
import store from './chat/store';

import MinimisedChat from './chat/components/MinimisedChat'

document.addEventListener('DOMContentLoaded', minimisedChatFunction, {once: true});

function minimisedChatFunction() {
    const chatNode = document.getElementById('minimized-chat');
    const notChat  = chatNode ? chatNode.classList.contains('without-chat') : false;
    if (chatNode) {
        ReactDOM.render(
            <Provider store={store}>
                <BrowserNotification/>

                {!notChat &&
                <MinimisedChat/>
                }
            </Provider>,
            chatNode
        );
    }
}