import React from 'react';
import {Provider as AlertProvider} from 'react-alert';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {alertOptions, AlertTemplate} from '~/helpers';
import {Company} from './components/Company';
import {DeveloperCompanies, DeveloperCompaniesInstance} from './DeveloperCompanies';

import store from './store';

(node => node && ReactDOM.render(
    <AlertProvider template={AlertTemplate} {...alertOptions}>
        <Provider store={store}>
            <BrowserRouter>
                <Switch>
                    <Route exact path={DeveloperCompanies.componentUrl}
                           component={DeveloperCompaniesInstance}/>
                    <Route exact path={Company.componentUrl}
                           component={DeveloperCompaniesInstance}/>
                </Switch>
            </BrowserRouter>
        </Provider>
    </AlertProvider>,
    node
))(document.getElementById('admin-developers-features'));