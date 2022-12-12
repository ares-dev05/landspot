import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {Provider as AlertProvider} from 'react-alert';
import {alertOptions, AlertTemplate} from './helpers';
import UserProfile from './profile';
import store from './profile/store';

(node => node && ReactDOM.render(
    <AlertProvider template={AlertTemplate} {...alertOptions}>
        <Provider store={store}>
            <UserProfile/>
        </Provider>
    </AlertProvider>,
    node
))(document.getElementById('user-profile'));