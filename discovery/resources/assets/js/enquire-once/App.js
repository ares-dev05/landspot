import React from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import EnquireOnce from './components/EnquireOnce';
import MultiStepForm from './components/MultiStepForm';

const App = () => (
    <Router>
        <Switch>
            <Route exact path={EnquireOnce.componentUrl} component={EnquireOnce}/>
            <Route exact path={MultiStepForm.componentUrl} component={MultiStepForm}/>
        </Switch>
    </Router>
);

export default App;