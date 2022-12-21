import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {Provider as AlertProvider} from 'react-alert';

import store from './store/index';

import {GuidelineProfileComponent, GuidelineProfileInstance} from './pages/GuidelineProfileComponent';
import FormulaLibraryComponent from './pages/FormulaLibraryComponent';
import {SelectionModeComponent, SelectionModeInstance} from './pages/SelectionModeComponent';
import PackageSettingsComponent from './pages/PackageSettingsComponent';
import SiteCostsComponent from './pages/SiteCostsComponent';
import MyEstatesComponent from './pages/MyEstatesComponent';
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
                            path={FormulaLibraryComponent.componentUrl}
                            component={FormulaLibraryComponent}
                        />
                        {/*<Route*/}
                        {/*    exact*/}
                        {/*    path={SelectionModeComponent.estateUrl}*/}
                        {/*    component={SelectionModeComponent}*/}
                        {/*/>*/}
                        <Route
                            exact
                            path={SelectionModeComponent.componentUrl}
                            component={SelectionModeInstance}
                        />
                        <Route
                            exact
                            path={PackageSettingsComponent.componentUrl}
                            component={PackageSettingsComponent}
                        />
                        <Route
                            exact
                            path={SiteCostsComponent.componentUrl}
                            component={SiteCostsComponent}
                        />
                        <Route
                            exact
                            path={MyEstatesComponent.componentUrl}
                            component={MyEstatesComponent}
                        />
                        <Route
                            exact
                            path={GuidelineProfileComponent.componentUrl}
                            component={GuidelineProfileInstance}
                        />
                    </Switch>
                </BrowserRouter>
            </Provider>
        </AlertProvider>,
        node
    ))(document.getElementById('kaspa-engine'));
