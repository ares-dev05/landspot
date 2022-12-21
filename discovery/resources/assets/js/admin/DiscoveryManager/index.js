    import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {Provider as AlertProvider} from 'react-alert';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

import store from './store/index';

import DiscoveryManager from './DiscoveryManager';
import {alertOptions, AlertTemplate} from '~/helpers';


(node => node && ReactDOM.render(
    <AlertProvider template={AlertTemplate} {...alertOptions}>
        <Provider store={store}>
            <BrowserRouter>
                <Switch>
                    <Route exact path="/manager" component={DiscoveryManager}/>
                </Switch>
            </BrowserRouter>
        </Provider>
    </AlertProvider>,
    node
))(document.getElementById('discovery-manager'));