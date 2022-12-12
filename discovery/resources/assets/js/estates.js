import React from 'react';
import {Provider as AlertProvider} from 'react-alert';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {alertOptions, AlertTemplate} from './helpers';
import EstateInstance, {Estate} from './landspot/components/Estate-new';
import {LandspotLotPackageInstance, LotPackages} from './landspot/LotPackages';
import {
    LandspotEstatesInstance,
    LandspotEstates
} from './landspot/LandspotEstates';

import store from './landspot/store';

(node =>
    node &&
    ReactDOM.render(
        <AlertProvider template={AlertTemplate} {...alertOptions}>
            <Provider store={store}>
                <BrowserRouter>
                    <Switch>
                        <Route
                            exact
                            path={LandspotEstates.componentUrl}
                            component={LandspotEstatesInstance}
                        />
                        <Route
                            exact
                            path={Estate.componentUrl}
                            component={EstateInstance}
                        />
                        <Route
                            exact
                            path={LotPackages.componentUrl}
                            component={LandspotLotPackageInstance}
                        />
                    </Switch>
                </BrowserRouter>
            </Provider>
        </AlertProvider>,
        node
    ))(document.getElementById('landspot-estates'));
