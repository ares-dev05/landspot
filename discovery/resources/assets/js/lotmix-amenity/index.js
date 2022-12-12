import React from 'react';
import ReactDOM from 'react-dom';
import EstateAmenities from './components/EstateAmenities';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {Provider} from 'react-redux';
import store from './store';


(node => node && ReactDOM.render(
    <Provider store={store}>
        <Router>
            <Switch>
                <Route render={(props) => <EstateAmenities {...props} />}/>
            </Switch>
        </Router>
    </Provider>,
    node
))(document.getElementById('lotmix-amenities'));