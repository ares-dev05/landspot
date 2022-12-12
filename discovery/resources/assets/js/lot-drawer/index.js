import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

import store from './store';
import {LotDrawerContainer, LotDrawerContainerInstance} from './LotDrawerContainer';
import {Provider as AlertProvider} from 'react-alert';
import {alertOptions, AlertTemplate} from '~/helpers';

(node => node && ReactDOM.render(
    <AlertProvider template={AlertTemplate} {...alertOptions}>
        <Provider store={store}>
            <BrowserRouter>
                <Switch>
                    <Route path={LotDrawerContainer.componentUrl}
                           component={LotDrawerContainerInstance}/>
                </Switch>
            </BrowserRouter>
        </Provider>
    </AlertProvider>,
    node
))(document.getElementById('lot-drawer'));