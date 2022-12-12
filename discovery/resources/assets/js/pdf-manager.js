import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

import store from './admin/PdfManagers/store';
import CompaniesCatalogue from './admin/PdfManagers/CompaniesCatalogue';
import {Provider as AlertProvider} from 'react-alert';
import {alertOptions, AlertTemplate} from "./helpers";

(node => node && ReactDOM.render(
    <AlertProvider template={AlertTemplate} {...alertOptions}>
        <Provider store={store}>
            <BrowserRouter>
                <Switch>
                    <Route exact path="/landspot/pdf-manager" component={CompaniesCatalogue}/>
                    <Route exact path="/landspot/pdf-manager/company/:companyID"
                           component={CompaniesCatalogue}/>
                </Switch>
            </BrowserRouter>
        </Provider>
    </AlertProvider>,
    node
))(document.getElementById('pdf-manager'));