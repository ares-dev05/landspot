import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';

import store from './discovery/store';

import Catalogue from './discovery/Catalogue';
import House from './discovery/House';

const App = (baseUrl) => (
    <Provider store={store}>
        <Router>
            <Switch>
                <Route exact path={`${baseUrl}`} component={Catalogue}/>
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
        App('/discovery'),
        node
    )
)(document.getElementById('discovery'));

(node => node && ReactDOM.render(
        App('/footprints'),
        node
    )
)(document.getElementById('footprints'));