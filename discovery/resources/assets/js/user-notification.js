import React from 'react';
import {Provider as AlertProvider} from 'react-alert';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {alertOptions, AlertTemplate} from './helpers';
import AcceptTOS from './user-notification/AcceptTOS';
import Notification from './user-notification/Notification';

import store from './user-notification/store';

(node => node && ReactDOM.render(
    <AlertProvider template={AlertTemplate} {...alertOptions}>
        <Provider store={store}>
            <Notification/>
            <AcceptTOS/>
        </Provider>
    </AlertProvider>,
    node
))(document.getElementById('user-notification'));