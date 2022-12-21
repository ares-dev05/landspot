import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';

import CompaniesCatalogue from './discovery-landdeveloper/CompaniesCatalogue';
import House from './discovery/House';
import store from './discovery-landdeveloper/store';

const App = (baseUrl) => (
    <Provider store={store}>
        <Router>
            <Switch>
                <Route exact path={`${baseUrl}`} component={CompaniesCatalogue}/>
                <Route exact path={`${baseUrl}/company/:companyID`} component={CompaniesCatalogue}/>
                <Route exact path={`${baseUrl}/overview/:houseId`} component={House}/>
                <Route exact path={`${baseUrl}/floorplan/:houseId`} component={House}/>
                <Route exact path={`${baseUrl}/available-options/:houseId`} component={House}/>
                <Route exact path={`${baseUrl}/gallery/:houseId`} component={House}/>
                <Route exact path={`${baseUrl}/volume/:houseId`} component={House}/>
                <Route component={() => <Redirect to={baseUrl}/>}/>
            </Switch>
        </Router>
    </Provider>
);

(node => node && ReactDOM.render(
        App('/landspot/discovery'),
        node
    )
)(document.getElementById('developer-discovery'));