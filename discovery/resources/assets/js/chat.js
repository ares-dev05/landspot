import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import store from "./chat/store";

import Chat from './chat/components/Chat';

(chatNode => chatNode && ReactDOM.render(
    <Provider store={store}>
        <Chat/>
    </Provider>,
    chatNode
))(document.getElementById('landspot-chat'));