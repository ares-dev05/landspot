import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import LotmixNotification from './lotmix-notification/LotmixNotification';

import store from './lotmix-notification/store';
import {Provider as AlertProvider} from 'react-alert';
import {alertOptions, AlertTemplate} from '~/helpers';

(node => node && ReactDOM.render(
    <AlertProvider template={AlertTemplate} {...alertOptions}>
        <Provider store={store}>
            <LotmixNotification/>
        </Provider>
    </AlertProvider>,
    node
))(document.getElementById('lotmix-notification'));