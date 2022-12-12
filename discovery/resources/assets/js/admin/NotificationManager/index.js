import React from 'react';
import ReactDOM from 'react-dom';
import {Provider as AlertProvider} from 'react-alert';
import {alertOptions, AlertTemplate} from '~/helpers';
import NotificationManager from './NotificationManager';

(node => node && ReactDOM.render(
    <AlertProvider template={AlertTemplate} {...alertOptions}>
        <NotificationManager />
    </AlertProvider>,
    node
))(document.getElementById('notifications'));
