import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {Provider as AlertProvider} from 'react-alert';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

import store from './store/index';

import SiteAdminSettings from './SiteAdminSettings';
import {alertOptions, AlertTemplate} from '~/helpers';

(node => node && ReactDOM.render(
    <AlertProvider template={AlertTemplate} {...alertOptions}>
        <Provider store={store}>
            <BrowserRouter>
                <Switch>
                    <Route exact path="/landspot/site-settings" component={SiteAdminSettings}/>
                </Switch>
            </BrowserRouter>
        </Provider>
    </AlertProvider>,
    node
))(document.getElementById('admin-site-settings'));