import React from 'react';
import ReactDOM from 'react-dom';
import EstateFaq from './components/EstateFaq';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {Provider} from 'react-redux';
import store from './store';


(node => node && ReactDOM.render(
    <Provider store={store}>
        <Router>
            <Switch>
                <Route render={(props) => <EstateFaq {...props} />}/>
            </Switch>
        </Router>
    </Provider>,
    node
))(document.getElementById('lotmix-faq'));