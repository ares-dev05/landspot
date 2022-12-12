import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

import store from './store';
import CompaniesCatalogue from './CompaniesCatalogue';
import {Provider as AlertProvider} from 'react-alert';
import {alertOptions, AlertTemplate} from '~/helpers';
import CompaniesList from './components/CompaniesList';
import {Company} from './components/Company';

(node => node && ReactDOM.render(
    <AlertProvider template={AlertTemplate} {...alertOptions}>
        <Provider store={store}>
            <BrowserRouter>
                <Switch>
                    <Route exact path={CompaniesList.componentUrl}
                           component={CompaniesCatalogue}/>
                    <Route exact path={Company.componentUrl}
                           component={CompaniesCatalogue}/>
                </Switch>
            </BrowserRouter>
        </Provider>
    </AlertProvider>,
    node
))(document.getElementById('user-manager'));