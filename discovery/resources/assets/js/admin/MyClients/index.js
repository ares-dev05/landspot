import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {Provider as AlertProvider} from 'react-alert';

import store from './store/index';

import MyClientsComponent from './components/MyClientsComponent';
import {DraftSitingsInstance, DraftSitingsComponent} from './components/DraftSitingsComponent';
import {alertOptions, AlertTemplate} from '~/helpers';

(node =>
    node &&
    ReactDOM.render(
        <AlertProvider template={AlertTemplate} {...alertOptions}>
            <Provider store={store}>
                <BrowserRouter>
                    <Switch>
                        <Route
                            exact
                            path={MyClientsComponent.componentUrl}
                            component={MyClientsComponent}
                        />
                        <Route
                            exact
                            path={DraftSitingsComponent.draftSitingsUrl}
                            component={DraftSitingsInstance}
                        />
                        <Route
                            exact
                            path={DraftSitingsComponent.legacySitingsUrl}
                            render={(props) => <DraftSitingsInstance oldSitings {...props}/>}
                        />
                    </Switch>
                </BrowserRouter>
            </Provider>
        </AlertProvider>,
        node
    ))(document.getElementById('my-clients'));
