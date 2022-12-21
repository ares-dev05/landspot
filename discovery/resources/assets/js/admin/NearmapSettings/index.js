import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {Provider as AlertProvider} from 'react-alert';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

import store from './store/index';

import NearmapAdminSettings from './NearmapAdminSettings';
import {alertOptions, AlertTemplate} from '~/helpers';

(node => node && ReactDOM.render(
    <AlertProvider template={AlertTemplate} {...alertOptions}>
        <Provider store={store}>
            <BrowserRouter>
                <Switch>
                    <Route exact path="/landspot/nearmap-settings" component={NearmapAdminSettings}/>
                </Switch>
            </BrowserRouter>
        </Provider>
    </AlertProvider>,
    node
))(document.getElementById('admin-nearmap-settings'));